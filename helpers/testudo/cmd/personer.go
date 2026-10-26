/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"github.com/spf13/cobra"
)

type personerOptions struct {
	antall     int
	kql        string
	navn       bool
	register   bool
	jsonOutput bool
	env        string
}

func newPersonerCmd() *cobra.Command {
	opts := &personerOptions{}

	cmd := &cobra.Command{
		Use:   "personer",
		Short: "Hent testpersoner fra Tenor",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runPersoner(opts)
		},
	}

	cmd.Flags().IntVarP(
		&opts.antall, "antall", "n", 1,
		"Antall personer som hentes",
	)
	cmd.Flags().StringVar(
		&opts.kql, "kql", "",
		"Egendefinert KQL (default: bosatt + myndig)",
	)
	cmd.Flags().BoolVar(
		&opts.navn, "navn", false,
		"Skriv ut navn (fornavn etternavn) ved siden av fnr",
	)
	cmd.Flags().BoolVar(
		&opts.register, "register", false,
		"Berik med Altinn-ID-er fra Register (impliserer JSON)",
	)
	cmd.Flags().BoolVar(
		&opts.jsonOutput, "json", false,
		"Skriv ut full kildedata som JSON",
	)
	cmd.Flags().StringVar(
		&opts.env, "env", "tt02",
		"Miljø for env-fil: tt02, at22, at23",
	)

	return cmd
}

func runPersoner(opts *personerOptions) error {
	// Implement the actual logic here.
	return nil
}

func init() {
	tenorCmd.AddCommand(newPersonerCmd())
}
