package cmd

import "github.com/spf13/cobra"

// newFindCmd groups the commands that find test data.
func newFindCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "find",
		Short: "Find test persons and organizations",
		Long: `Find test persons and organizations. They are fetched from Tenor and enriched
with data from Altinn Register, and all of them exist in Register for the
environment in --env.`,
	}
	cmd.AddCommand(newPersonsCmd(), newOrganizationsCmd())
	return cmd
}
