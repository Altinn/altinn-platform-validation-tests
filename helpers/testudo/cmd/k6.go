package cmd

import "github.com/spf13/cobra"

// newK6Cmd groups the commands for the K6 tests.
func newK6Cmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "k6",
		Short: "Make the manifests that run the K6 tests in the k6 cluster",
		Long: `Make the Kubernetes manifests that run the K6 tests in the k6 cluster, from
config files such as functional.yaml, smoke.yaml and breakpoint.yaml under K6/.`,
	}
	cmd.AddCommand(newK6GenerateCmd())
	return cmd
}
