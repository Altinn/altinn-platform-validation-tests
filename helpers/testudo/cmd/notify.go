package cmd

import (
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/config"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/playwright"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/slack"
)

// maxListedTests is how many failed tests the Slack message names.
const maxListedTests = 5

type notifyPlaywrightOptions struct {
	env            string
	report         string
	reportURL      string
	playwrightExit int
	dryRun         bool
}

// newNotifyCmd groups the commands that send notifications.
func newNotifyCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "notify",
		Short: "Send notifications about test runs",
	}
	cmd.AddCommand(newNotifyPlaywrightCmd())
	return cmd
}

func newNotifyPlaywrightCmd() *cobra.Command {
	opts := &notifyPlaywrightOptions{}

	cmd := &cobra.Command{
		Use:   "playwright",
		Short: "Send the result of a Playwright run to Slack",
		Long: `Reads the JSON report from Playwright and sends a Slack message with the
environment, the number of failed tests, the first failed tests and the link to
the report. If the report is missing or no tests ran, the message says that the
run did not start.

The message is sent to the webhook in SLACK_WEBHOOK_URL.`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if opts.env == "" {
				return fmt.Errorf("%w: --env must be set", errs.Invalid)
			}
			text := playwrightMessage(opts, cmd.ErrOrStderr())
			if opts.dryRun {
				fmt.Fprintln(cmd.OutOrStdout(), text)
				return nil
			}
			webhookURL := config.For("")("SLACK_WEBHOOK_URL")
			if webhookURL == "" {
				return config.WithHint(fmt.Errorf("%w: SLACK_WEBHOOK_URL is missing", errs.Invalid))
			}
			if err := slack.Send(cmd.Context(), webhookURL, text); err != nil {
				return err
			}
			fmt.Fprintln(cmd.ErrOrStderr(), "Slack notification sent")
			return nil
		},
	}

	cmd.Flags().StringVar(&opts.env, "env", "", "Environment the tests ran against, e.g. at23 or prod")
	cmd.Flags().StringVar(&opts.report, "report", "test-results.json", "Path to the Playwright JSON report")
	cmd.Flags().StringVar(&opts.reportURL, "report-url", "", "URL to the published HTML report")
	cmd.Flags().IntVar(&opts.playwrightExit, "playwright-exit", 0, "Exit code from Playwright, shown when no tests ran")
	cmd.Flags().BoolVar(&opts.dryRun, "dry-run", false, "Print the message instead of sending it")

	return cmd
}

// playwrightMessage builds the Slack message. A globalSetup that stops the run
// gives a report without tests, and if Playwright crashes before the report is
// written there is no report at all. Both are reported as a run that did not
// start.
func playwrightMessage(opts *notifyPlaywrightOptions, log io.Writer) string {
	data, err := os.ReadFile(opts.report)
	if err != nil {
		fmt.Fprintf(log, "Could not read the report: %v\n", err)
		return notStartedMessage(opts.env, opts.playwrightExit)
	}
	summary, err := playwright.Summarize(data)
	if err != nil {
		fmt.Fprintf(log, "Could not read the report: %v\n", err)
		return notStartedMessage(opts.env, opts.playwrightExit)
	}
	if summary.Ran == 0 {
		return notStartedMessage(opts.env, opts.playwrightExit)
	}
	return failedMessage(summary, opts.env, opts.reportURL)
}

// failedMessage names only the test titles, not the error messages, since they
// can contain test data from prod.
func failedMessage(summary playwright.Summary, env, reportURL string) string {
	var b strings.Builder
	fmt.Fprintf(&b, ":red_circle: *%s*: %d of %d Playwright tests failed", environmentName(env), len(summary.Failed), summary.Ran)
	for i, title := range summary.Failed {
		if i == maxListedTests {
			fmt.Fprintf(&b, "\n…and %d more, see the report", len(summary.Failed)-maxListedTests)
			break
		}
		fmt.Fprintf(&b, "\n• %s", escapeSlack(title))
	}
	fmt.Fprintf(&b, "\nReport: %s", reportURL)
	return b.String()
}

func notStartedMessage(env string, playwrightExit int) string {
	return fmt.Sprintf(
		":warning: *%s*: The Playwright run did not start (exit %d). The report is empty, check the pod log.",
		environmentName(env), playwrightExit,
	)
}

func environmentName(env string) string {
	if env == "prod" {
		return "Production"
	}
	return env
}

// escapeSlack escapes the characters Slack reads as markup.
func escapeSlack(text string) string {
	return strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;").Replace(text)
}
