/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"github.com/spf13/cobra"
)

type virksomheterOptions struct {
	antall     int
	kql        string
	register   bool
	jsonOutput bool
	env        string
}

func newVirksomheterCmd() *cobra.Command {
	opts := &virksomheterOptions{}

	cmd := &cobra.Command{
		Use:   "virksomheter",
		Short: "Hent virksomheter fra Tenor i bulk",
		RunE: func(cmd *cobra.Command, args []string) error {
			if opts.register {
				opts.jsonOutput = true
			}

			return runVirksomheter(opts)
		},
	}

	cmd.Flags().IntVarP(
		&opts.antall, "antall", "n", 10,
		"Antall virksomheter som hentes",
	)
	cmd.Flags().StringVar(
		&opts.kql, "kql", "organisasjonsform.kode:AS",
		"Egendefinert KQL",
	)
	cmd.Flags().BoolVar(
		&opts.register, "register", false,
		"Berik med Altinn-ID-er fra Register (impliserer JSON)",
	)
	cmd.Flags().BoolVar(
		&opts.jsonOutput, "json", false,
		"Skriv ut som JSON",
	)
	cmd.Flags().StringVar(
		&opts.env, "env", "tt02",
		"Miljø for env-fil: tt02, at22, at23",
	)

	return cmd
}

func runVirksomheter(opts *virksomheterOptions) error {
	// Implement the actual logic here.
	return nil
}

func init() {
	tenorCmd.AddCommand(newVirksomheterCmd())

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// virksomheterCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// virksomheterCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
