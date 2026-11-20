package cmd

import (
	"errors"
	"strings"
	"testing"

	"github.com/spf13/viper"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// withConfig loads YAML as the config file in viper for the duration of the
// test.
func withConfig(t *testing.T, content string) {
	t.Helper()
	viper.Reset()
	t.Cleanup(viper.Reset)
	viper.SetConfigType("yaml")
	if err := viper.ReadConfig(strings.NewReader(content)); err != nil {
		t.Fatal(err)
	}
}

func TestNewRegisterClient(t *testing.T) {
	common := "TOKEN_GENERATOR_USERNAME: b\nTOKEN_GENERATOR_PASSWORD: p\n"
	tests := []struct {
		name    string
		yaml    string
		env     string
		invalid bool
	}{
		{"ok", common + "at23:\n  API_BASE_URL: https://platform.at23.altinn.cloud\n  REGISTER_SUBSCRIPTION_KEY: k\n", "at23", false},
		// The name from the frontend works too.
		{"frontend name", common + "AT23_REGISTER_SUBSCRIPTION_KEY: k\nat23:\n  API_BASE_URL: https://platform.at23.altinn.cloud\n", "at23", false},
		{"unknown environment", common, "at99", true},
		{"ENV_NAME does not match", common + "at23:\n  API_BASE_URL: x\n  ENV_NAME: at22\n  REGISTER_SUBSCRIPTION_KEY: k\n", "at23", true},
		{"missing API_BASE_URL", common + "at23:\n  REGISTER_SUBSCRIPTION_KEY: k\n", "at23", true},
		{"API_BASE_URL only for another environment", common + "at22:\n  API_BASE_URL: x\n  REGISTER_SUBSCRIPTION_KEY: k\n", "at23", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			withConfig(t, tt.yaml)
			s, err := readRegisterSetup(tt.env)
			if tt.invalid {
				if !errors.Is(err, errs.Invalid) {
					t.Errorf("err = %v", err)
				}
				return
			}
			if err != nil {
				t.Fatal(err)
			}
			if s.baseURL != "https://platform.at23.altinn.cloud" || s.key != "k" || s.token.Username != "b" {
				t.Errorf("s = %+v", s)
			}
			if _, err := newRegisterClient(tt.env); err != nil {
				t.Errorf("newRegisterClient: %v", err)
			}
		})
	}

	t.Run("missing subscription key", func(t *testing.T) {
		withConfig(t, common+"at23:\n  API_BASE_URL: x\n")
		_, err := newRegisterClient("at23")
		if err == nil || !strings.Contains(err.Error(), "REGISTER_SUBSCRIPTION_KEY is missing for at23") ||
			!strings.Contains(err.Error(), "~/.testudo.yaml") {
			t.Errorf("err = %v", err)
		}
	})
}
