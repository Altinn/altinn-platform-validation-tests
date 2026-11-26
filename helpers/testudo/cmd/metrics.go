package cmd

import (
	"fmt"
	"os"
	"time"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/metrics"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/playwright"
)

// testsFailedExitCode is the exit code when at least one test failed. It is
// the one helpers/junitparser uses, and the script that runs Playwright in the
// cluster reads it.
const testsFailedExitCode = 53

type metricsPlaywrightOptions struct {
	env         string
	report      string
	pushgateway string
	dryRun      bool
}

// newMetricsCmd groups the commands that push metrics.
func newMetricsCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "metrics",
		Short: "Push metrics about test runs",
	}
	cmd.AddCommand(newMetricsPlaywrightCmd())
	return cmd
}

func newMetricsPlaywrightCmd() *cobra.Command {
	opts := &metricsPlaywrightOptions{}

	cmd := &cobra.Command{
		Use:   "playwright",
		Short: "Push the result of a Playwright run to the Prometheus Pushgateway",
		Long: `Reads the JUnit report from Playwright and pushes metrics for the run, each
spec file and each test to the Prometheus Pushgateway, under the job
playwright_tests and the environment. What the Pushgateway has for the same job
and environment is replaced.

The metrics have the names helpers/junitparser gives them. A spec file gets one
series per browser and language, taken from the project name, for example
at23-chromium-bokmål.

testudo exits with code 53 when at least one test failed, after the metrics are
pushed.`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if opts.env == "" {
				opts.env = os.Getenv("DEPLOY_ENV")
			}
			if opts.env == "" {
				return fmt.Errorf("%w: --env or DEPLOY_ENV must be set", errs.Invalid)
			}
			data, err := os.ReadFile(opts.report)
			if err != nil {
				return fmt.Errorf("read the report: %w", err)
			}
			report, err := playwright.ParseJUnit(data)
			if err != nil {
				return err
			}

			log := cmd.ErrOrStderr()
			reg, failed := metrics.Playwright(report, opts.env, time.Now(), log)
			if opts.dryRun {
				if err := metrics.Write(cmd.OutOrStdout(), reg); err != nil {
					return err
				}
			} else {
				if err := metrics.Push(cmd.Context(), opts.pushgateway, metrics.PlaywrightJob, opts.env, reg, log); err != nil {
					return err
				}
				fmt.Fprintln(log, "Metrics pushed to the Pushgateway")
			}

			if failed {
				fmt.Fprintln(log, "At least one test failed")
				cmd.SilenceErrors = true
				cmd.SilenceUsage = true
				return exitCode(testsFailedExitCode)
			}
			return nil
		},
	}

	cmd.Flags().StringVar(&opts.env, "env", "", "Environment the tests ran against, e.g. at23 or prod (default is $DEPLOY_ENV)")
	cmd.Flags().StringVar(&opts.report, "report", "test-results.xml", "Path to the Playwright JUnit report")
	cmd.Flags().StringVar(&opts.pushgateway, "pushgateway-url", "http://prometheus-pushgateway.monitoring:9091", "URL to the Prometheus Pushgateway")
	cmd.Flags().BoolVar(&opts.dryRun, "dry-run", false, "Print the metrics instead of pushing them")

	return cmd
}
