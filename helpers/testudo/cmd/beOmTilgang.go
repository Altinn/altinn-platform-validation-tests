/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"github.com/spf13/cobra"
)

type beOmTilgangOptions struct {
	antall int
	ut     string
	env    string
}

func newBeOmTilgangCmd() *cobra.Command {
	opts := &beOmTilgangOptions{}

	cmd := &cobra.Command{
		Use:   "be-om-tilgang",
		Short: "Hent virksomheter fra Tenor og skriv resultatet til JSON",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runBeOmTilgang(opts)
		},
	}

	cmd.Flags().IntVarP(
		&opts.antall, "antall", "n", 200,
		"Antall virksomheter i output",
	)

	cmd.Flags().StringVar(
		&opts.ut, "ut", defaultOutput,
		"Fil JSON-resultatet skrives til",
	)

	cmd.Flags().StringVar(
		&opts.env, "env", "tt02",
		"Miljø for env-fil: tt02, at22, at23",
	)

	return cmd
}

func runBeOmTilgang(opts *beOmTilgangOptions) error {
	// Implement the actual logic here.
	return nil
}

func init() {
	tenorCmd.AddCommand(newBeOmTilgangCmd())
}
