package cmd

import "github.com/spf13/cobra"

// newFindCmd samler kommandoene som finner testdata.
func newFindCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "find",
		Short: "Finn testpersoner og virksomheter",
		Long: `Finn testpersoner og virksomheter. De hentes fra Tenor og beriket med data
fra Altinn Register, og alle finnes i Register for miljøet i --env.`,
	}
	cmd.AddCommand(newPersonsCmd(), newOrganizationsCmd())
	return cmd
}
