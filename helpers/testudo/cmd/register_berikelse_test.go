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

// medEnvFiler skriver .env og .env.<miljø> til en temp-mappe og peker envFil
// dit så lenge testen varer.
func medEnvFiler(t *testing.T, filer map[string]string) {
	t.Helper()
	dir := t.TempDir()
	for navn, innhold := range filer {
		if err := os.WriteFile(filepath.Join(dir, navn), []byte(innhold), 0o600); err != nil {
			t.Fatal(err)
		}
	}
	gammel := envFil
	envFil = filepath.Join(dir, ".env")
	t.Cleanup(func() { envFil = gammel })
}

func TestLesEnvFiler(t *testing.T) {
	medEnvFiler(t, map[string]string{
		".env":      "FELLES=fra-env\nOVERSTYRT=fra-env\n",
		".env.at23": "OVERSTYRT=fra-at23\nAPI_BASE_URL=https://platform.at23.altinn.cloud\n",
	})
	t.Setenv("FRA_SHELL", "shell")

	hent, err := lesEnvFiler("at23")
	if err != nil {
		t.Fatal(err)
	}
	for k, vil := range map[string]string{
		"FELLES": "fra-env", "OVERSTYRT": "fra-at23",
		"API_BASE_URL": "https://platform.at23.altinn.cloud", "FRA_SHELL": "shell",
	} {
		if got := hent(k); got != vil {
			t.Errorf("%s = %q, vil ha %q", k, got, vil)
		}
	}

	if _, err := lesEnvFiler("at22"); err == nil {
		t.Error("manglende .env.at22 skal gi feil")
	}
}

func TestNyRegisterKlient(t *testing.T) {
	felles := "USERNAME_TEST_API=b\nPASSWORD_TEST_API=p\nAT23_REGISTER_SUBSCRIPTION_KEY=k\n"
	tests := []struct {
		navn    string
		env     string
		miljoe  string
		ugyldig bool
	}{
		{"ok", "API_BASE_URL=https://platform.at23.altinn.cloud\nENV_NAME=AT23\n", "at23", false},
		{"ukjent miljø", "", "at99", true},
		{"ENV_NAME stemmer ikke", "API_BASE_URL=x\nENV_NAME=at22\n", "at23", true},
		{"mangler API_BASE_URL", "ENV_NAME=at23\n", "at23", true},
	}
	for _, tt := range tests {
		t.Run(tt.navn, func(t *testing.T) {
			medEnvFiler(t, map[string]string{".env": felles, ".env.at23": tt.env})
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
		medEnvFiler(t, map[string]string{
			".env":      "USERNAME_TEST_API=b\nPASSWORD_TEST_API=p\n",
			".env.at23": "API_BASE_URL=x\n",
		})
		if _, err := nyRegisterKlient("at23"); err == nil || !strings.Contains(err.Error(), "AT23_REGISTER_SUBSCRIPTION_KEY") {
			t.Errorf("err = %v", err)
		}
	})
}
