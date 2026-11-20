package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/k6manifest"
)

// The folders k6 generate writes to, in the folder it runs in.
const (
	k6ConfDir  = ".conf"
	k6BuildDir = ".build"
	k6DistDir  = ".dist"
)

func newK6GenerateCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "generate <config file> [-- <k6 arguments>]",
		Short: "Make the manifests for the tests in a config file",
		Long: `Make the Kubernetes manifests that run the tests in a config file, for every
environment in it where the test is enabled.

Run it from the root of the repository, since the paths in the config file are
relative to it. k6 must be on PATH.

Each test gets .dist/<test id>/ with configmap.json and testrun.json, which can
be applied with kubectl apply --server-side -f .dist/ -R. .conf/ gets the config
file with all defaults filled in and the k6 config for each test, and .build/
the k6 archives. The three folders are emptied first, so manifests from an
earlier run are not applied by mistake.

Arguments after -- are given to k6 in the TestRun. Each -e or --env KEY=VALUE
among them is also set as an environment variable for the test.`,
		Example: `  testudo k6 generate K6/api/tests/portaler/smoke.yaml
  testudo k6 generate K6/api/tests/access-management/consent/breakpoint.yaml -- --env BREAKPOINT_STAGE_TARGET=50`,
		Args: func(cmd *cobra.Command, args []string) error {
			n := len(args)
			if dash := cmd.ArgsLenAtDash(); dash >= 0 {
				n = dash
			}
			if n != 1 {
				return fmt.Errorf("%w: expected one config file, got %d", errs.Invalid, n)
			}
			return nil
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			// The arguments are fine by now, so the help text is not
			// printed for errors from here on.
			cmd.SilenceUsage = true
			var k6Args []string
			if dash := cmd.ArgsLenAtDash(); dash >= 0 {
				k6Args = args[dash:]
			}
			for _, dir := range []string{k6ConfDir, k6BuildDir, k6DistDir} {
				if err := os.RemoveAll(dir); err != nil {
					return err
				}
			}
			g := k6manifest.K8sManifestGenerator{
				ConfigDirectory:   k6ConfDir,
				DistDirectory:     k6DistDir,
				BuildDirectory:    k6BuildDir,
				RepoRootDirectory: ".",
				CommandLineArgs:   strings.Join(k6Args, " "),
			}
			cf, err := g.Initialize(args[0])
			if err != nil {
				return err
			}
			return g.Generate(*cf)
		},
	}
}
