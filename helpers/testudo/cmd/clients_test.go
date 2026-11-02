package cmd

import (
	"errors"
	"strings"
	"testing"

	"github.com/spf13/viper"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

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
			o, err := lesRegisterOppsett(tt.miljoe)
			if tt.ugyldig {
				if !errors.Is(err, errs.Invalid) {
					t.Errorf("err = %v", err)
				}
				return
			}
			if err != nil {
				t.Fatal(err)
			}
			if o.baseURL != "https://platform.at23.altinn.cloud" || o.noekkel != "k" || o.token.Username != "b" {
				t.Errorf("o = %+v", o)
			}
			if _, err := nyRegisterKlient(tt.miljoe); err != nil {
				t.Errorf("nyRegisterKlient: %v", err)
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
