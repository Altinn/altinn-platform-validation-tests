package cmd

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const (
	passedJUnitReport = `<testsuites>
<testsuite name="a.spec.ts" hostname="at23-chromium-bokmål" tests="1" failures="0" skipped="0" errors="0" time="1.5">
<testcase name="logs in" classname="a.spec.ts" time="1.5"></testcase>
</testsuite>
</testsuites>`
	failedJUnitReport = `<testsuites>
<testsuite name="a.spec.ts" hostname="at23-chromium-bokmål" tests="1" failures="1" skipped="0" errors="0" time="1.5">
<testcase name="logs in" classname="a.spec.ts" time="1.5"><failure message="failed" type="FAILURE"></failure></testcase>
</testsuite>
</testsuites>`
)

func writeJUnitReport(t *testing.T, data string) string {
	t.Helper()
	report := filepath.Join(t.TempDir(), "test-results.xml")
	if err := os.WriteFile(report, []byte(data), 0o600); err != nil {
		t.Fatal(err)
	}
	return report
}

func TestMetricsPlaywrightDryRun(t *testing.T) {
	report := writeJUnitReport(t, passedJUnitReport)
	out, err := execute("metrics", "playwright", "--env", "at23", "--report", report, "--dry-run")
	if err != nil {
		t.Fatalf("%v\n%s", err, out)
	}
	for _, line := range []string{
		`playwright_tests_total{browser="chromium",deploy_env="at23",language="bokmål",suite="a.spec.ts"} 1`,
		`playwright_test_status{browser="chromium",deploy_env="at23",language="bokmål",suite="a.spec.ts",test="logs in"} 0`,
		`playwright_test_run_status{deploy_env="at23"} 0`,
	} {
		if !strings.Contains(out, line) {
			t.Errorf("missing %s in:\n%s", line, out)
		}
	}
}

func TestMetricsPlaywrightFailedTestsExitWith53(t *testing.T) {
	report := writeJUnitReport(t, failedJUnitReport)
	out, err := execute("metrics", "playwright", "--env", "at23", "--report", report, "--dry-run")
	if code, ok := errors.AsType[exitCode](err); !ok || code != 53 {
		t.Fatalf("got %v, want exit code 53\n%s", err, out)
	}
	if !strings.Contains(out, `playwright_test_run_status{deploy_env="at23"} 1`) {
		t.Errorf("the run is not failed:\n%s", out)
	}
	if strings.Contains(out, "Error:") || strings.Contains(out, "Usage:") {
		t.Errorf("cobra printed the exit code as an error:\n%s", out)
	}
}

func TestMetricsPlaywrightEnvFromDeployEnv(t *testing.T) {
	t.Setenv("DEPLOY_ENV", "tt02")
	out, err := execute("metrics", "playwright", "--report", writeJUnitReport(t, passedJUnitReport), "--dry-run")
	if err != nil {
		t.Fatalf("%v\n%s", err, out)
	}
	if !strings.Contains(out, `playwright_test_run_status{deploy_env="tt02"} 0`) {
		t.Errorf("DEPLOY_ENV is not used:\n%s", out)
	}
}

func TestMetricsPlaywrightRequiresEnv(t *testing.T) {
	t.Setenv("DEPLOY_ENV", "")
	if _, err := execute("metrics", "playwright", "--report", writeJUnitReport(t, passedJUnitReport), "--dry-run"); err == nil {
		t.Error("expected an error without --env and DEPLOY_ENV")
	}
}

func TestMetricsPlaywrightMissingReport(t *testing.T) {
	_, err := execute("metrics", "playwright", "--env", "at23", "--report", filepath.Join(t.TempDir(), "missing.xml"), "--dry-run")
	if err == nil {
		t.Fatal("expected an error without a report")
	}
	if _, ok := errors.AsType[exitCode](err); ok {
		t.Errorf("got an exit code for a missing report: %v", err)
	}
}
