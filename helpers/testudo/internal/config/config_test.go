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
SHARED: from-top-level
OVERRIDDEN: from-top-level
at23:
  OVERRIDDEN: from-at23
  API_BASE_URL: https://platform.at23.altinn.cloud
`)); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FROM_SHELL", "shell")
	t.Setenv("SHARED", "shell-wins")

	lookup := For("at23")
	for k, want := range map[string]string{
		"SHARED": "shell-wins", "OVERRIDDEN": "from-at23",
		"API_BASE_URL": "https://platform.at23.altinn.cloud", "FROM_SHELL": "shell",
		"DOES_NOT_EXIST": "",
	} {
		if got := lookup(k); got != want {
			t.Errorf("%s = %q, want %q", k, got, want)
		}
	}
	// Without an environment only the top level is used.
	if got := For("")("OVERRIDDEN"); got != "from-top-level" {
		t.Errorf("without environment: OVERRIDDEN = %q", got)
	}
}

func TestLoad(t *testing.T) {
	viper.Reset()
	t.Cleanup(viper.Reset)
	path := filepath.Join(t.TempDir(), "testudo.yaml")
	if err := os.WriteFile(path, []byte("MASKINPORTEN_CLIENT_ID: from-file\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := Load(path); err != nil {
		t.Fatal(err)
	}
	if got := For("")("MASKINPORTEN_CLIENT_ID"); got != "from-file" {
		t.Errorf("MASKINPORTEN_CLIENT_ID = %q", got)
	}
	if !strings.Contains(WithHint(os.ErrNotExist).Error(), path) {
		t.Errorf("hint = %v", WithHint(os.ErrNotExist))
	}

	// A file that is given must exist.
	viper.Reset()
	if err := Load(filepath.Join(t.TempDir(), "does-not-exist.yaml")); err == nil {
		t.Error("expected an error when the file is missing")
	}
}
