package cmd

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/k6manifest"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tools"
)

// The folders k6 generate writes to, in the folder it runs in.
const (
	k6ConfDir    = ".conf"
	k6BuildDir   = ".build"
	k6DistDir    = ".dist"
	k6CronJobDir = ".cronjobs"
)

func newK6GenerateCmd() *cobra.Command {
	var cronJobsOnly bool
	var slack string
	var parallel int
	cmd := &cobra.Command{
		Use:   "generate <config file> [-- <k6 arguments>]",
		Short: "Make the manifests for the tests in a config file",
		Long: `Make the Kubernetes manifests that run the tests in a config file, for every
environment in it where the test is enabled, and the CronJob that runs them on
a schedule.

Run it from the root of the repository, since the paths in the config file are
relative to it. k6 must be on PATH.

Each test gets .dist/<test id>/ with configmap.json and testrun.json, which can
be applied with kubectl apply --server-side -f .dist/ -R. .conf/ gets the config
file with all defaults filled in and the k6 config for each test, and .build/
the k6 archives.

The CronJob goes to .cronjobs/, apart from the tests, so applying .dist/ never
changes a schedule. It runs on the schedule set with schedule: in the config
file (a cron expression), or by default every 15 minutes for functional,
healthcheck and browser tests and every hour for smoke tests. Breakpoint tests
only get a CronJob when their file has a schedule.

The four folders are emptied first, so manifests from an earlier run are not
applied by mistake.

With --cronjobs-only, only the CronJobs are made, for one or more config files,
and only .cronjobs/ is emptied. k6 is not needed then.

--slack picks the Slack secret, and so the channel the tests post failed
checks to: test (the default) gives slack-test, and environment gives
slack-dev for at22, at23 and yt01 and slack-prod for tt02 and prod.

--parallel is how many tests are made at the same time, and so how many k6
processes run at once. The default is the number of CPUs testudo may use,
which in a container is its CPU limit. A test that fails does not stop the
others: every failed test is listed with its test id, and leaves nothing in
.dist/.

Arguments after -- are given to k6 in the TestRun. Each -e or --env KEY=VALUE
among them is also set as an environment variable for the test.`,
		Example: `  testudo k6 generate K6/api/tests/portaler/smoke.yaml
  testudo k6 generate --slack environment K6/api/tests/portaler/smoke.yaml
  testudo k6 generate K6/api/tests/access-management/consent/breakpoint.yaml -- --env BREAKPOINT_STAGE_TARGET=50
  testudo k6 generate --cronjobs-only K6/api/tests/portaler/smoke.yaml K6/api/tests/portaler/functional.yaml`,
		Args: func(cmd *cobra.Command, args []string) error {
			n := len(args)
			if dash := cmd.ArgsLenAtDash(); dash >= 0 {
				n = dash
				if cronJobsOnly {
					return fmt.Errorf("%w: k6 arguments are not used with --cronjobs-only", errs.Invalid)
				}
			}
			if cronJobsOnly && n < 1 {
				return fmt.Errorf("%w: expected one or more config files", errs.Invalid)
			}
			if !cronJobsOnly && n != 1 {
				return fmt.Errorf("%w: expected one config file, got %d", errs.Invalid, n)
			}
			if !k6manifest.Slack(slack).Valid() || slack == "" {
				return fmt.Errorf("%w: --slack must be %s or %s, got %q", errs.Invalid, k6manifest.SlackTest, k6manifest.SlackEnvironment, slack)
			}
			if cmd.Flags().Changed("parallel") {
				if cronJobsOnly {
					return fmt.Errorf("%w: --parallel is not used with --cronjobs-only", errs.Invalid)
				}
				if parallel < 1 {
					return fmt.Errorf("%w: --parallel must be 1 or more, got %d", errs.Invalid, parallel)
				}
			}
			return nil
		},
		PreRunE: func(cmd *cobra.Command, args []string) error {
			// The arguments are fine by now, so the help text is not
			// printed for errors from here on.
			cmd.SilenceUsage = true
			// Checked before the folders are emptied or the config file is
			// read. The CronJobs are made without k6.
			if cronJobsOnly {
				return nil
			}
			return tools.Require("k6")
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			if cronJobsOnly {
				return generateCronJobs(args)
			}
			var k6Args []string
			if dash := cmd.ArgsLenAtDash(); dash >= 0 {
				k6Args = args[dash:]
			}
			if err := removeAll(k6ConfDir, k6BuildDir, k6DistDir, k6CronJobDir); err != nil {
				return err
			}
			g := k6manifest.K8sManifestGenerator{
				ConfigDirectory:   k6ConfDir,
				DistDirectory:     k6DistDir,
				BuildDirectory:    k6BuildDir,
				CronJobDirectory:  k6CronJobDir,
				RepoRootDirectory: ".",
				CommandLineArgs:   strings.Join(k6Args, " "),
				Slack:             k6manifest.Slack(slack),
				Parallel:          parallel,
				GenerationTime:    time.Now(),
			}
			cf, err := g.Initialize(args[0])
			if err != nil {
				return err
			}
			if err := g.WriteCronJob(args[0], cf); err != nil {
				return err
			}
			return g.Generate(*cf)
		},
	}
	cmd.Flags().BoolVar(&cronJobsOnly, "cronjobs-only", false, "only make the CronJobs, for one or more config files")
	cmd.Flags().StringVar(&slack, "slack", string(k6manifest.SlackTest), "Slack secret for the tests: test (slack-test) or environment (slack-dev or slack-prod)")
	cmd.Flags().IntVar(&parallel, "parallel", 0, "how many tests to make at the same time (default: the number of CPUs)")
	return cmd
}

// generateCronJobs writes the CronJob for each config file. A file that fails
// does not stop the others; the errors are returned together.
func generateCronJobs(configFiles []string) error {
	if err := removeAll(k6CronJobDir); err != nil {
		return err
	}
	g := k6manifest.K8sManifestGenerator{CronJobDirectory: k6CronJobDir, RepoRootDirectory: "."}
	var failed []error
	for _, path := range configFiles {
		cf, err := k6manifest.ReadConfigFile(path)
		if err == nil {
			err = g.WriteCronJob(path, cf)
		}
		if err != nil {
			failed = append(failed, err)
		}
	}
	return errors.Join(failed...)
}

func removeAll(dirs ...string) error {
	for _, dir := range dirs {
		if err := os.RemoveAll(dir); err != nil {
			return err
		}
	}
	return nil
}
