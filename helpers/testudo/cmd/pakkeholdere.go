/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"strings"

	"github.com/spf13/cobra"
)

type pakkeholdereOptions struct {
	miljo      string
	antall     int
	org        string
	pakke      string
	jsonOutput bool
}

func newPakkeholdereCmd() *cobra.Command {
	opts := &pakkeholdereOptions{}

	cmd := &cobra.Command{
		Use:   "pakkeholdere",
		Short: "Bygg en virksomhet der mange brukere har samme tilgangspakke (altinn-auth#829)",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runPakkeholdere(opts)
		},
	}

	cmd.Flags().StringVar(
		&opts.miljo,
		"env",
		"at23",
		strings.Join(miljoer, " | "),
	)

	cmd.Flags().IntVarP(
		&opts.antall,
		"antall",
		"n",
		10,
		"Antall brukere som skal ha hovedpakken",
	)

	cmd.Flags().StringVar(
		&opts.org,
		"org",
		"",
		"Bruk denne virksomheten i stedet for å finne en ny",
	)

	cmd.Flags().StringVar(
		&opts.pakke,
		"pakke",
		"",
		"Gi bare denne pakken, til samtlige brukere, i stedet for trappa i FORDELING. Tar kort navn eller full urn.",
	)

	cmd.Flags().BoolVar(
		&opts.jsonOutput,
		"json",
		false,
		"Skriv ut resultatet som JSON",
	)

	return cmd
}

func runPakkeholdere(opts *pakkeholdereOptions) error {
	// Implement the actual logic here.
	return nil
}

func init() {
	tenorCmd.AddCommand(newPakkeholdereCmd())
}
