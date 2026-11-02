// Package config leser konfigurasjonen til testudo: nøkler og adresser leses
// fra miljøet eller fra config-fila (standard ~/.testudo.yaml).
//
// Config-fila har felles verdier på toppnivået og verdier for hvert miljø i
// en egen seksjon:
//
//	MASKINPORTEN_CLIENT_ID: '...'
//	MASKINPORTEN_JWK: '{"kty":"RSA",...}'
//	TOKEN_GENERATOR_USERNAME: '...'
//	TOKEN_GENERATOR_PASSWORD: '...'
//	at23:
//	  API_BASE_URL: 'https://platform.at23.altinn.cloud'
//	  REGISTER_SUBSCRIPTION_KEY: '...'
package config

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/viper"
)

// Environments er miljøene testudo kan brukes mot.
var Environments = []string{"tt02", "at22", "at23", "yt01"}

// Load leser config-fila i path, eller ~/.testudo.yaml når path er tom. Uten
// path er det greit at fila mangler, siden alt også kan settes som
// miljøvariabler. En fil som finnes, men ikke kan leses, er en feil.
func Load(path string) error {
	if path != "" {
		viper.SetConfigFile(path)
	} else {
		home, err := os.UserHomeDir()
		if err != nil {
			return err
		}
		viper.AddConfigPath(home)
		viper.SetConfigType("yaml")
		viper.SetConfigName(".testudo")
	}
	viper.SetEnvKeyReplacer(strings.NewReplacer("-", "_"))
	viper.SetEnvPrefix("TESTUDO")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		var ikkeFunnet viper.ConfigFileNotFoundError
		if path != "" || !errors.As(err, &ikkeFunnet) {
			return fmt.Errorf("les config-fil: %w", err)
		}
	}
	return nil
}

// For gir et oppslag for env. En verdi hentes fra miljøvariabelen med samme
// navn, så fra seksjonen for env i config-fila, så fra toppnivået i
// config-fila. Tom env hopper over seksjonen.
func For(env string) func(string) string {
	return func(k string) string {
		if v, ok := os.LookupEnv(k); ok {
			return v
		}
		if env != "" {
			if v := viper.GetString(env + "." + k); v != "" {
				return v
			}
		}
		return viper.GetString(k)
	}
}

// WithHint legger til hvor verdien kan settes, når konfigurasjonen mangler
// noe.
func WithHint(err error) error {
	fil := viper.ConfigFileUsed()
	if fil == "" {
		fil = "~/.testudo.yaml"
	}
	return fmt.Errorf("%w (sett den i %s eller som miljøvariabel)", err, fil)
}
