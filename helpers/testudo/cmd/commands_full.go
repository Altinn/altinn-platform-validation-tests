//go:build !slim

package cmd

// The full build of testudo: the commands for finding test data, and the
// commands used in automation. The slim build, made with -tags slim, leaves
// the automation commands out (commands_slim.go). Their files have the build
// constraint !slim.

import "github.com/spf13/cobra"

// variant is the build of testudo, shown by testudo version.
const variant = "full"

// rootShort and rootAbout describe testudo in its help.
const (
	rootShort = "Test data and K6 manifests for the tests in altinn-platform-validation-tests"
	rootAbout = `It also makes the Kubernetes manifests that run the K6 tests in the k6
cluster, serves the find commands as an HTTP API, and sends the results of
Playwright runs to Slack.`
)

// automationCommands are the commands used in automation.
func automationCommands() []*cobra.Command {
	return []*cobra.Command{newServeCmd(), newNotifyCmd(), newK6Cmd()}
}
