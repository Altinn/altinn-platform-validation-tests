/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"maps"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/spf13/cobra"
	"github.com/subosito/gotenv"
)

// tenorCmd represents the tenor command
var tenorCmd = &cobra.Command{
	Use:   "tenor",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("tenor called")
	},
}

// frontendEnvFil er .env-filen i altinn-access-management-frontend, som
// inntil videre er der Maskinporten-nøklene ligger. Stien er relativ til
// helpers/testudo, med repoene ved siden av hverandre.
const frontendEnvFil = "../../../altinn-access-management-frontend/playwright/config/.env"

var envFil string

// lesEnvFiler leser envFil og, hvis miljoe er satt, .env.<miljoe> i samme
// mappe, slik loadEnv i frontend gjør. Miljøfilen går foran envFil, og
// variabler som er satt i miljøet går foran begge.
func lesEnvFiler(miljoe string) (func(string) string, error) {
	filer := []string{envFil}
	if miljoe != "" {
		filer = append(filer, filepath.Join(filepath.Dir(envFil), ".env."+miljoe))
	}
	verdier := map[string]string{}
	for _, f := range filer {
		m, err := gotenv.Read(f)
		if err != nil {
			return nil, fmt.Errorf("les env-fil %s: %w", f, err)
		}
		maps.Copy(verdier, m)
	}
	return func(k string) string {
		if v, ok := os.LookupEnv(k); ok {
			return v
		}
		return verdier[k]
	}, nil
}

// nyTenorKlient lager en Tenor-klient med Maskinporten-token, med
// MASKINPORTEN_CLIENT_ID og MASKINPORTEN_JWK fra envFil.
func nyTenorKlient() (*TenorClient, error) {
	hent, err := lesEnvFiler("")
	if err != nil {
		return nil, err
	}
	cfg, err := MaskinportenConfigFra(hent)
	if err != nil {
		return nil, err
	}
	mp, err := NewMaskinportenClient(cfg, tenorScope)
	if err != nil {
		return nil, err
	}
	return NewTenorClient(mp), nil
}

// nyRegisterKlient lager en Register-klient for miljoe med platform-token fra
// test token generator. API_BASE_URL og ENV_NAME leses fra .env.<miljoe>, og
// subscription key fra <MILJOE>_REGISTER_SUBSCRIPTION_KEY.
func nyRegisterKlient(miljoe string) (*RegisterClient, error) {
	if !slices.Contains(miljoer, miljoe) {
		return nil, fmt.Errorf("%w: ukjent miljø %q, bruk en av %s", ErrInvalid, miljoe, strings.Join(miljoer, ", "))
	}
	hent, err := lesEnvFiler(miljoe)
	if err != nil {
		return nil, err
	}
	if navn := hent("ENV_NAME"); navn != "" && !strings.EqualFold(navn, miljoe) {
		return nil, fmt.Errorf("%w: ENV_NAME er %q, men --env er %q", ErrInvalid, navn, miljoe)
	}
	baseURL := hent("API_BASE_URL")
	if baseURL == "" {
		return nil, fmt.Errorf("%w: API_BASE_URL mangler for %s", ErrInvalid, miljoe)
	}
	noekkelNavn := strings.ToUpper(miljoe) + "_REGISTER_SUBSCRIPTION_KEY"
	noekkel := hent(noekkelNavn)
	if noekkel == "" {
		return nil, fmt.Errorf("%w: %s mangler", ErrInvalid, noekkelNavn)
	}

	pcfg, err := PlatformTokenConfigFra(hent, miljoe)
	if err != nil {
		return nil, err
	}
	pt, err := NewPlatformTokenGenerator(pcfg)
	if err != nil {
		return nil, err
	}
	return NewRegisterClient(baseURL, noekkel, pt), nil
}

func init() {
	rootCmd.AddCommand(tenorCmd)

	tenorCmd.PersistentFlags().StringVar(
		&envFil, "env-fil", frontendEnvFil,
		"Env-fil med MASKINPORTEN_CLIENT_ID og MASKINPORTEN_JWK",
	)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// tenorCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// tenorCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
