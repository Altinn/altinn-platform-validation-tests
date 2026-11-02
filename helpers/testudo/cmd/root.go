// Package cmd er kommandolinjen til testudo. Kommandoene leser flagg og
// konfigurasjon, setter opp klientene og skriver ut resultatet. Resten ligger
// i internal/.
package cmd

import (
	"os"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/config"
)

// Execute kjører testudo. Den kalles fra main.
func Execute() {
	if err := newRootCmd().Execute(); err != nil {
		os.Exit(1)
	}
}

func newRootCmd() *cobra.Command {
	var configFil string
	root := &cobra.Command{
		Use:   "testudo",
		Short: "Testdata for testene i altinn-platform-validation-tests",
		Long: `testudo finner testpersoner og virksomheter som finnes både i Tenor og i
Altinn Register, og skriver dem ut som tekst, JSON eller CSV.`,
		// Config-fila leses før kommandoen kjører. Ingenting skrives til
		// stdout her, siden stdout er resultatet.
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			return config.Load(configFil)
		},
	}
	root.PersistentFlags().StringVar(&configFil, "config", "", "config file (default is $HOME/.testudo.yaml)")
	root.AddCommand(newFindCmd())
	return root
}
