package config

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/spf13/viper"
)

func TestFor(t *testing.T) {
	viper.Reset()
	t.Cleanup(viper.Reset)
	viper.SetConfigType("yaml")
	if err := viper.ReadConfig(strings.NewReader(`
FELLES: fra-toppnivaa
OVERSTYRT: fra-toppnivaa
at23:
  OVERSTYRT: fra-at23
  API_BASE_URL: https://platform.at23.altinn.cloud
`)); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FRA_SHELL", "shell")
	t.Setenv("FELLES", "shell-vinner")

	hent := For("at23")
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
	if got := For("")("OVERSTYRT"); got != "fra-toppnivaa" {
		t.Errorf("uten miljø: OVERSTYRT = %q", got)
	}
}

func TestLoad(t *testing.T) {
	viper.Reset()
	t.Cleanup(viper.Reset)
	sti := filepath.Join(t.TempDir(), "testudo.yaml")
	if err := os.WriteFile(sti, []byte("MASKINPORTEN_CLIENT_ID: fra-fil\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := Load(sti); err != nil {
		t.Fatal(err)
	}
	if got := For("")("MASKINPORTEN_CLIENT_ID"); got != "fra-fil" {
		t.Errorf("MASKINPORTEN_CLIENT_ID = %q", got)
	}
	if !strings.Contains(WithHint(os.ErrNotExist).Error(), sti) {
		t.Errorf("hint = %v", WithHint(os.ErrNotExist))
	}

	// En fil som er oppgitt, må finnes.
	viper.Reset()
	if err := Load(filepath.Join(t.TempDir(), "finnes-ikke.yaml")); err == nil {
		t.Error("ventet feil når fila mangler")
	}
}
