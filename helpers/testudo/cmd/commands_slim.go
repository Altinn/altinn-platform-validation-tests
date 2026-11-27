//go:build slim

package cmd

// The slim build of testudo, made with -tags slim: only the commands for
// finding test data, for developers and testers. The commands used in
// automation are only in the full build (commands_full.go).

import "github.com/spf13/cobra"

// variant is the build of testudo, shown by testudo version.
const variant = "slim"

// rootShort and rootAbout describe testudo in its help.
const (
	rootShort = "Test data for the tests in altinn-platform-validation-tests"
	rootAbout = `This is the slim build of testudo, with only the commands for finding test
data. The full build also has the commands used in automation.`
)

// automationCommands is empty, since the slim build has no automation
// commands.
func automationCommands() []*cobra.Command { return nil }
