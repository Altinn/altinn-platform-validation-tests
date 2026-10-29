package cmd

// Konfigurasjon for kommandoene: nøkler og adresser leses fra miljøet eller
// fra config-fila (standard ~/.testudo.yaml, se initConfig i root.go).
//
// Config-fila har felles verdier på toppnivået og verdier for hvert miljø i
// en egen seksjon:
//
//	MASKINPORTEN_CLIENT_ID: '...'
//	MASKINPORTEN_JWK: '{"kty":"RSA",...}'
//	USERNAME_TEST_API: '...'
//	PASSWORD_TEST_API: '...'
//	at23:
//	  API_BASE_URL: 'https://platform.at23.altinn.cloud'
//	  REGISTER_SUBSCRIPTION_KEY: '...'

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

// konfig gir et oppslag for miljoe. En verdi hentes fra miljøvariabelen med
// samme navn, så fra seksjonen for miljoe i config-fila, så fra toppnivået i
// config-fila. Tom miljoe hopper over seksjonen.
func konfig(miljoe string) func(string) string {
	return func(k string) string {
		if v, ok := os.LookupEnv(k); ok {
			return v
		}
		if miljoe != "" {
			if v := viper.GetString(miljoe + "." + k); v != "" {
				return v
			}
		}
		return viper.GetString(k)
	}
}

// medKonfigHint legger til hvor verdien kan settes, når konfigurasjonen
// mangler noe.
func medKonfigHint(err error) error {
	fil := viper.ConfigFileUsed()
	if fil == "" {
		fil = "~/.testudo.yaml"
	}
	return fmt.Errorf("%w (sett den i %s eller som miljøvariabel)", err, fil)
}
