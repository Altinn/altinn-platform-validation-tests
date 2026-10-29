/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"cmp"
	"fmt"
	"slices"
	"strings"

	"github.com/spf13/cobra"
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

// nyTenorKlient lager en Tenor-klient med Maskinporten-token, med
// MASKINPORTEN_CLIENT_ID og MASKINPORTEN_JWK fra konfigurasjonen.
func nyTenorKlient() (*TenorClient, error) {
	cfg, err := MaskinportenConfigFra(konfig(""))
	if err != nil {
		return nil, medKonfigHint(err)
	}
	mp, err := NewMaskinportenClient(cfg, tenorScope)
	if err != nil {
		return nil, err
	}
	return NewTenorClient(mp), nil
}

// nyRegisterKlient lager en Register-klient for miljoe med platform-token fra
// test token generator. API_BASE_URL og subscription key leses fra seksjonen
// for miljoe i konfigurasjonen. Subscription key kan også hete
// <MILJOE>_REGISTER_SUBSCRIPTION_KEY, som i frontend.
func nyRegisterKlient(miljoe string) (*RegisterClient, error) {
	if !slices.Contains(miljoer, miljoe) {
		return nil, fmt.Errorf("%w: ukjent miljø %q, bruk en av %s", ErrInvalid, miljoe, strings.Join(miljoer, ", "))
	}
	hent := konfig(miljoe)
	if navn := hent("ENV_NAME"); navn != "" && !strings.EqualFold(navn, miljoe) {
		return nil, fmt.Errorf("%w: ENV_NAME er %q, men --env er %q", ErrInvalid, navn, miljoe)
	}
	baseURL := hent("API_BASE_URL")
	if baseURL == "" {
		return nil, medKonfigHint(fmt.Errorf("%w: API_BASE_URL mangler for %s", ErrInvalid, miljoe))
	}
	noekkel := cmp.Or(hent(strings.ToUpper(miljoe)+"_REGISTER_SUBSCRIPTION_KEY"), hent("REGISTER_SUBSCRIPTION_KEY"))
	if noekkel == "" {
		return nil, medKonfigHint(fmt.Errorf("%w: REGISTER_SUBSCRIPTION_KEY mangler for %s", ErrInvalid, miljoe))
	}

	pcfg, err := PlatformTokenConfigFra(hent, miljoe)
	if err != nil {
		return nil, medKonfigHint(err)
	}
	pt, err := NewPlatformTokenGenerator(pcfg)
	if err != nil {
		return nil, err
	}
	return NewRegisterClient(baseURL, noekkel, pt), nil
}

func init() {
	rootCmd.AddCommand(tenorCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// tenorCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// tenorCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
