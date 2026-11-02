package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/spf13/viper"
)

func TestRunPersonerByttesUtNaarDeIkkeFinnesIRegister(t *testing.T) {
	kall := 0
	tenor := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		kall++
		// Første runde gir person 1 og 2. Person 2 finnes ikke i Register, så
		// neste runde gir en ny: person 3.
		if kall == 1 {
			w.Write(fregSvar(t, 100, 1, 1, 3))
		} else {
			w.Write(fregSvar(t, 100, 1, 3, 4))
		}
	})
	reg := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("fields") != "party,person,org,user" {
			t.Errorf("fields = %q", r.URL.Query().Get("fields"))
		}
		var data []string
		for _, u := range lesQuery(t, r) {
			switch u {
			case string(PersonUrn("00000000001")):
				data = append(data, `{"partyUuid":"u-1","partyId":501,"partyType":"person","personIdentifier":"00000000001","user":{"userId":20001}}`)
			case string(PersonUrn("00000000003")):
				data = append(data, `{"partyUuid":"u-3","partyId":503,"partyType":"person","personIdentifier":"00000000003","user":{"userId":20003}}`)
			}
		}
		w.Write([]byte(`{"data":[` + strings.Join(data, ",") + `]}`))
	})

	var ut, logg bytes.Buffer
	err := runPersoner(context.Background(), tenor, reg, &ut, &logg, &personerOptions{antall: 2, jsonOutput: true, env: "at23"})
	if err != nil {
		t.Fatal(err)
	}

	var rader []map[string]any
	if err := json.Unmarshal(ut.Bytes(), &rader); err != nil {
		t.Fatalf("ikke JSON: %v\n%s", err, ut.String())
	}
	if len(rader) != 2 || kall != 2 {
		t.Fatalf("rader = %d, kall til Tenor = %d", len(rader), kall)
	}
	foerste, andre := rader[0], rader[1]
	// Feltene fra Tenor og Register ligger på samme nivå.
	if foerste["foedselsnummer"] != "00000000001" || foerste["navn"] != "Person 1" || foerste["kildedata"] == nil ||
		foerste["partyId"] != float64(501) || foerste["partyUuid"] != "u-1" ||
		foerste["user"].(map[string]any)["userId"] != float64(20001) {
		t.Errorf("første = %v", foerste)
	}
	if _, finnes := foerste["altinn"]; finnes {
		t.Errorf("altinn skal ikke finnes lenger: %v", foerste)
	}
	if andre["foedselsnummer"] != "00000000003" || andre["partyUuid"] != "u-3" {
		t.Errorf("andre = %v", andre)
	}
	if !strings.Contains(logg.String(), "Register (at23): 1 personer fra Tenor finnes ikke og er byttet ut.") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestRunPersonerIngenIRegister(t *testing.T) {
	tenor := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(fregSvar(t, 2, 1, 1, 3))
	})
	err := runPersoner(context.Background(), tenor, tomtRegister(t), &bytes.Buffer{}, &bytes.Buffer{}, &personerOptions{antall: 2, env: "at23"})
	if !errors.Is(err, ErrNotFound) || !strings.Contains(err.Error(), "finnes i Register for at23") {
		t.Errorf("err = %v", err)
	}
}

func TestRunPersonerRegisterUtenKlient(t *testing.T) {
	err := runPersoner(context.Background(), nil, nil, &bytes.Buffer{}, &bytes.Buffer{}, &personerOptions{antall: 1})
	if !errors.Is(err, ErrInvalid) {
		t.Errorf("err = %v", err)
	}
}

// tomtRegister er et Register der ingen parter finnes.
func tomtRegister(t *testing.T) *RegisterClient {
	t.Helper()
	return testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"data":[]}`))
	})
}

// ekkoRegister er et Register der alle parter finnes, for tester som ikke
// handler om Register. Personer får partyUuid p-<fnr> og bruker, virksomheter
// o-<orgnr>. Navn tas ikke med, så navnene fra Tenor brukes.
func ekkoRegister(t *testing.T) *RegisterClient {
	t.Helper()
	return testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		var data []string
		for i, u := range lesQuery(t, r) {
			id := u[strings.LastIndex(u, ":")+1:]
			if strings.Contains(u, ":person:") {
				data = append(data, fmt.Sprintf(`{"partyUuid":"p-%s","partyId":%d,"partyType":"person","personIdentifier":"%s","user":{"userId":%d}}`, id, 1000+i, id, 2000+i))
			} else {
				data = append(data, fmt.Sprintf(`{"partyUuid":"o-%s","partyId":%d,"partyType":"organization","organizationIdentifier":"%s"}`, id, 1000+i, id))
			}
		}
		w.Write([]byte(`{"data":[` + strings.Join(data, ",") + `]}`))
	})
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
	felles := "TOKEN_GENERATOR_USERNAME: b\nTOKEN_GENERATOR_PASSWORD: p\n"
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
