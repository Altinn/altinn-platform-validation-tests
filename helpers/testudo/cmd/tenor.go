/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>

*/
package cmd

import (
	"fmt"
	"os"

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

// nyTenorKlient lager en Tenor-klient med Maskinporten-token, med
// MASKINPORTEN_CLIENT_ID og MASKINPORTEN_JWK fra envFil. Variabler som er satt
// i miljøet går foran filen.
func nyTenorKlient() (*TenorClient, error) {
	fil, err := gotenv.Read(envFil)
	if err != nil {
		return nil, fmt.Errorf("les env-fil %s: %w", envFil, err)
	}
	cfg, err := MaskinportenConfigFra(func(k string) string {
		if v, ok := os.LookupEnv(k); ok {
			return v
		}
		return fil[k]
	})
	if err != nil {
		return nil, err
	}
	mp, err := NewMaskinportenClient(cfg, tenorScope)
	if err != nil {
		return nil, err
	}
	return NewTenorClient(mp), nil
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
