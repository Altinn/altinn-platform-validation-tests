// Package cmd is the testudo command line. The commands read flags and
// configuration, set up the clients and print the result. The rest lives in
// internal/.
package cmd

import (
	"os"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/config"
)

// Execute runs testudo. It is called from main.
func Execute() {
	if err := newRootCmd().Execute(); err != nil {
		os.Exit(1)
	}
}

func newRootCmd() *cobra.Command {
	var configFile string
	root := &cobra.Command{
		Use:   "testudo",
		Short: "Test data for the tests in altinn-platform-validation-tests",
		Long: `testudo finds test persons and organizations that exist both in Tenor and in
Altinn Register, and prints them as text, JSON or CSV.

Flags are always written with two dashes, e.g. --count and --help.`,
		// The config file is read before the command runs. Nothing is written
		// to stdout here, since stdout is the result.
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			return config.Load(configFile)
		},
	}
	root.PersistentFlags().StringVar(&configFile, "config", "", "config file (default is $HOME/.testudo.yaml)")
	// Declared here so cobra does not add its own help flag with the -h
	// shorthand. testudo has no single-dash flags.
	root.PersistentFlags().Bool("help", false, "Show help for the command")
	root.AddCommand(newFindCmd())
	return root
}
