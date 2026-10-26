/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"strings"

	"github.com/spf13/cobra"
)

type facilitatorOrgnrOptions struct {
	rolle      string
	antall     int
	dagl       bool
	register   bool
	jsonOutput bool
	env        string
}

func newFacilitatorOrgnrCmd() *cobra.Command {
	opts := &facilitatorOrgnrOptions{}

	cmd := &cobra.Command{
		Use:   "facilitator-orgnr",
		Short: "Hent facilitator-orgnr fra Tenor i bulk",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runFacilitatorOrgnr(opts)
		},
	}

	cmd.Flags().StringVarP(
		&opts.rolle,
		"rolle",
		"r",
		"revisor",
		strings.Join(roller, " | "),
	)

	cmd.Flags().IntVarP(
		&opts.antall,
		"antall",
		"n",
		10,
		"Antall unike facilitator-orgnr som hentes",
	)

	cmd.Flags().BoolVar(
		&opts.dagl,
		"dagl",
		false,
		"Slå også opp daglig leder for hver facilitator",
	)

	cmd.Flags().BoolVar(
		&opts.register,
		"register",
		false,
		"Berik med Altinn-ID-er fra Register (impliserer JSON)",
	)

	cmd.Flags().BoolVar(
		&opts.jsonOutput,
		"json",
		false,
		"Skriv ut som JSON",
	)

	cmd.Flags().StringVar(
		&opts.env,
		"env",
		"tt02",
		"Miljø for env-fil: tt02, at22, at23",
	)

	return cmd
}

func runFacilitatorOrgnr(opts *facilitatorOrgnrOptions) error {
	// Implement the actual logic here.
	return nil
}

func init() {
	tenorCmd.AddCommand(newFacilitatorOrgnrCmd())
}
