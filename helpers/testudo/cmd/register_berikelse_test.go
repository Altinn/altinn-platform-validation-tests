package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/spf13/viper"
)

func TestRunPersonerRegister(t *testing.T) {
	tenor := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(fregSvar(t, 2, 1, 1, 3))
	})
	reg := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("fields") != "party,person,org,user" {
			t.Errorf("fields = %q", r.URL.Query().Get("fields"))
		}
		// Bare den første personen finnes i miljøet.
		w.Write([]byte(`{"data":[{"partyUuid":"u-1","partyId":501,"partyType":"person",
			"personIdentifier":"00000000001","user":{"userId":20001}}]}`))
	})

	var ut, logg bytes.Buffer
	// --register gir JSON også uten --json.
	err := runPersoner(context.Background(), tenor, reg, &ut, &logg, &personerOptions{antall: 2, register: true, env: "at23"})
	if err != nil {
		t.Fatal(err)
	}

	var rader []map[string]any
	if err := json.Unmarshal(ut.Bytes(), &rader); err != nil {
		t.Fatalf("ikke JSON: %v\n%s", err, ut.String())
	}
	if len(rader) != 2 {
		t.Fatalf("rader = %d", len(rader))
	}
	foerste, andre := rader[0], rader[1]
	if foerste["foedselsnummer"] != "00000000001" || foerste["navn"] != "Person 1" || foerste["kildedata"] == nil {
		t.Errorf("Tenor-feltene mangler: %v", foerste)
	}
	altinn, ok := foerste["altinn"].(map[string]any)
	if !ok || altinn["partyId"] != float64(501) || altinn["partyUuid"] != "u-1" ||
		altinn["user"].(map[string]any)["userId"] != float64(20001) || foerste["altinnEnvironment"] != "at23" {
		t.Errorf("første = %v", foerste)
	}
	if v, finnes := andre["altinn"]; !finnes || v != nil || andre["altinnEnvironment"] != "at23" {
		t.Errorf("andre skal ha altinn: null: %v", andre)
	}
	if !strings.Contains(logg.String(), "Register (at23): 1 identifikatorer mangler; altinn = null.") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestRunPersonerRegisterUtenKlient(t *testing.T) {
	err := runPersoner(context.Background(), nil, nil, &bytes.Buffer{}, &bytes.Buffer{}, &personerOptions{antall: 1, register: true})
	if !errors.Is(err, ErrInvalid) {
		t.Errorf("err = %v", err)
	}
}

// medKonfig laster YAML som config-fil i viper så lenge testen varer.
func medKonfig(t *testing.T, innhold string) {
	t.Helper()
	viper.Reset()
	t.Cleanup(viper.Reset)
	viper.SetConfigType("yaml")
	if err := viper.ReadConfig(strings.NewReader(innhold)); err != nil {
		t.Fatal(err)
	}
}

func TestKonfig(t *testing.T) {
	medKonfig(t, `
FELLES: fra-toppnivaa
OVERSTYRT: fra-toppnivaa
at23:
  OVERSTYRT: fra-at23
  API_BASE_URL: https://platform.at23.altinn.cloud
`)
	t.Setenv("FRA_SHELL", "shell")
	t.Setenv("FELLES", "shell-vinner")

	hent := konfig("at23")
	for k, vil := range map[string]string{
		"FELLES": "shell-vinner", "OVERSTYRT": "fra-at23",
		"API_BASE_URL": "https://platform.at23.altinn.cloud", "FRA_SHELL": "shell",
		"FINNES_IKKE": "",
	} {
		if got := hent(k); got != vil {
			t.Errorf("%s = %q, vil ha %q", k, got, vil)
		}
	}
	// Uten miljø brukes bare toppnivået.
	if got := konfig("")("OVERSTYRT"); got != "fra-toppnivaa" {
		t.Errorf("uten miljø: OVERSTYRT = %q", got)
	}
}

func TestInitConfigMedConfigFlagg(t *testing.T) {
	sti := filepath.Join(t.TempDir(), "testudo.yaml")
	if err := os.WriteFile(sti, []byte("MASKINPORTEN_CLIENT_ID: fra-fil\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	viper.Reset()
	t.Cleanup(viper.Reset)
	gammel := cfgFile
	cfgFile = sti
	t.Cleanup(func() { cfgFile = gammel })

	initConfig()
	if got := konfig("")("MASKINPORTEN_CLIENT_ID"); got != "fra-fil" {
		t.Errorf("MASKINPORTEN_CLIENT_ID = %q", got)
	}
}

func TestNyRegisterKlient(t *testing.T) {
	felles := "USERNAME_TEST_API: b\nPASSWORD_TEST_API: p\n"
	tests := []struct {
		navn    string
		yaml    string
		miljoe  string
		ugyldig bool
	}{
		{"ok", felles + "at23:\n  API_BASE_URL: https://platform.at23.altinn.cloud\n  REGISTER_SUBSCRIPTION_KEY: k\n", "at23", false},
		// Navnet fra frontend virker også.
		{"frontend-navn", felles + "AT23_REGISTER_SUBSCRIPTION_KEY: k\nat23:\n  API_BASE_URL: https://platform.at23.altinn.cloud\n", "at23", false},
		{"ukjent miljø", felles, "at99", true},
		{"ENV_NAME stemmer ikke", felles + "at23:\n  API_BASE_URL: x\n  ENV_NAME: at22\n  REGISTER_SUBSCRIPTION_KEY: k\n", "at23", true},
		{"mangler API_BASE_URL", felles + "at23:\n  REGISTER_SUBSCRIPTION_KEY: k\n", "at23", true},
		{"API_BASE_URL bare for et annet miljø", felles + "at22:\n  API_BASE_URL: x\n  REGISTER_SUBSCRIPTION_KEY: k\n", "at23", true},
	}
	for _, tt := range tests {
		t.Run(tt.navn, func(t *testing.T) {
			medKonfig(t, tt.yaml)
			reg, err := nyRegisterKlient(tt.miljoe)
			if tt.ugyldig {
				if !errors.Is(err, ErrInvalid) {
					t.Errorf("err = %v", err)
				}
				return
			}
			if err != nil {
				t.Fatal(err)
			}
			if reg.baseURL != "https://platform.at23.altinn.cloud" || reg.subscriptionKey != "k" {
				t.Errorf("reg = %+v", reg)
			}
		})
	}

	t.Run("mangler subscription key", func(t *testing.T) {
		medKonfig(t, felles+"at23:\n  API_BASE_URL: x\n")
		_, err := nyRegisterKlient("at23")
		if err == nil || !strings.Contains(err.Error(), "REGISTER_SUBSCRIPTION_KEY mangler for at23") ||
			!strings.Contains(err.Error(), "~/.testudo.yaml") {
			t.Errorf("err = %v", err)
		}
	})
}
