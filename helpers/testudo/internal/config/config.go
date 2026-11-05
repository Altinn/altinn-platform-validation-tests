// Package config reads the testudo configuration: keys and addresses are read
// from the environment or from the config file (default ~/.testudo.yaml).
//
// The config file has shared values at the top level and values for each
// environment in a section of its own:
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

// Environments are the environments testudo can be used against.
var Environments = []string{"tt02", "at22", "at23", "yt01"}

// Load reads the config file at path, or ~/.testudo.yaml when path is empty.
// Without a path it is fine for the file to be missing, since everything can
// also be set as environment variables. A file that exists but cannot be read
// is an error.
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
		var notFound viper.ConfigFileNotFoundError
		if path != "" || !errors.As(err, &notFound) {
			return fmt.Errorf("read config file: %w", err)
		}
	}
	return nil
}

// For returns a lookup for env. A value is taken from the environment variable
// with the same name, then from the section for env in the config file, then
// from the top level of the config file. An empty env skips the section.
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

// WithHint adds where the value can be set, when the configuration is missing
// something.
func WithHint(err error) error {
	file := viper.ConfigFileUsed()
	if file == "" {
		file = "~/.testudo.yaml"
	}
	return fmt.Errorf("%w (set it in %s or as an environment variable)", err, file)
}
