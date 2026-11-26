package cmd

import (
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/buildinfo"
)

func newVersionCmd() *cobra.Command {
	var jsonOutput bool
	cmd := &cobra.Command{
		Use:   "version",
		Short: "Show which build of testudo this is",
		Long: `Show the commit testudo was built from, when that commit was made, and the Go
version and platform it was built for.

The commit is only known when testudo is built in a git checkout, for example
with make build, make install or the testudo-latest release. go run does not
record it.

The config file is not read, so this works even when it is broken.`,
		Example: `  testudo version
  testudo version --json`,
		Args: cobra.NoArgs,
		// Replaces the one on the root command, so the config file is not read.
		PersistentPreRunE: func(*cobra.Command, []string) error { return nil },
		RunE: func(cmd *cobra.Command, args []string) error {
			info := buildinfo.Read()
			if jsonOutput {
				return writeJSON(cmd.OutOrStdout(), info)
			}
			return writeVersion(cmd.OutOrStdout(), info)
		},
	}
	cmd.Flags().BoolVar(&jsonOutput, "json", false, "Print the build information as JSON")
	return cmd
}

// writeVersion prints info as text, one value on each line. The version line
// is left out when there is no version, as for a build in a checkout.
func writeVersion(out io.Writer, info buildinfo.Info) error {
	var b strings.Builder
	if info.Version != "" {
		fmt.Fprintf(&b, "version:     %s\n", info.Version)
	}
	commit, commitTime := "unknown", "unknown"
	if info.Commit != "" {
		commit = info.Commit
		if info.Modified {
			commit += ", with changes that were not committed"
		}
	}
	if !info.CommitTime.IsZero() {
		commitTime = info.CommitTime.Format(time.RFC3339)
	}
	fmt.Fprintf(&b, "commit:      %s\ncommit time: %s\ngo:          %s\nplatform:    %s\n",
		commit, commitTime, info.GoVersion, info.Platform)
	_, err := io.WriteString(out, b.String())
	return err
}
