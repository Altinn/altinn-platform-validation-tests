/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"strings"

	"github.com/spf13/cobra"
)

type facilitatorOptions struct {
	rolle        string
	antall       int
	maksKlienter int
	jsonOutput   bool
	env          string
}

func newFacilitatorCmd() *cobra.Command {
	opts := &facilitatorOptions{}

	cmd := &cobra.Command{
		Use:   "facilitator",
		Short: "Finn facilitator med færrest klienter",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runFacilitator(opts)
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
		5,
		"Antall klienter som hentes",
	)

	cmd.Flags().IntVarP(
		&opts.maksKlienter,
		"maks-klienter",
		"m",
		0,
		"Finn facilitator med færrest klienter, høyst <tall>",
	)

	cmd.Flags().BoolVar(
		&opts.jsonOutput,
		"json",
		false,
		"Skriv ut full struktur som JSON",
	)

	cmd.Flags().StringVar(
		&opts.env,
		"env",
		"tt02",
		"Miljø for env-fil: tt02, at22, at23",
	)

	return cmd
}

func runFacilitator(opts *facilitatorOptions) error {
	// Implement the actual logic here.
	return nil
}

func init() {
	tenorCmd.AddCommand(newFacilitatorCmd())
}
