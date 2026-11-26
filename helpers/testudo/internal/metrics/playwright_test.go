package metrics

import (
	"bytes"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/prometheus/client_golang/prometheus/testutil"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/playwright"
)

var runEnded = time.Unix(1793350000, 0)

func readReport(t *testing.T, path string) playwright.JUnitReport {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	report, err := playwright.ParseJUnit(data)
	if err != nil {
		t.Fatal(err)
	}
	return report
}

// The metrics and help texts must stay the ones helpers/junitparser pushes,
// since the dashboards and alerts read them.
func TestPlaywrightMetrics(t *testing.T) {
	var log bytes.Buffer
	reg, failed := Playwright(readReport(t, "testdata/junit.xml"), "at23", runEnded, &log)
	if !failed {
		t.Error("failed = false, want true")
	}
	if log.Len() > 0 {
		t.Errorf("unexpected log:\n%s", log.String())
	}

	want := `
# HELP playwright_suite_duration_seconds Duration of the test suite in seconds
# TYPE playwright_suite_duration_seconds gauge
playwright_suite_duration_seconds{browser="chromium",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts"} 20.91
playwright_suite_duration_seconds{browser="edge",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts"} 35.2
playwright_suite_duration_seconds{browser="edge",deploy_env="at23",language="bokmål",suite="innlogging/dyplenke.spec.ts"} 4.4
# HELP playwright_tests_total Total number of tests in the suite
# TYPE playwright_tests_total gauge
playwright_tests_total{browser="chromium",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts"} 2
playwright_tests_total{browser="edge",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts"} 2
playwright_tests_total{browser="edge",deploy_env="at23",language="bokmål",suite="innlogging/dyplenke.spec.ts"} 1
# HELP playwright_tests_passed Total number of passed tests in the suite
# TYPE playwright_tests_passed gauge
playwright_tests_passed{browser="chromium",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts"} 1
playwright_tests_passed{browser="edge",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts"} 1
playwright_tests_passed{browser="edge",deploy_env="at23",language="bokmål",suite="innlogging/dyplenke.spec.ts"} 0
# HELP playwright_tests_failed_total Total number of failed tests in the suite (failures + errors)
# TYPE playwright_tests_failed_total gauge
playwright_tests_failed_total{browser="chromium",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts"} 0
playwright_tests_failed_total{browser="edge",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts"} 1
playwright_tests_failed_total{browser="edge",deploy_env="at23",language="bokmål",suite="innlogging/dyplenke.spec.ts"} 1
# HELP playwright_tests_skipped_total Total number of skipped tests in the suite
# TYPE playwright_tests_skipped_total gauge
playwright_tests_skipped_total{browser="chromium",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts"} 1
playwright_tests_skipped_total{browser="edge",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts"} 0
playwright_tests_skipped_total{browser="edge",deploy_env="at23",language="bokmål",suite="innlogging/dyplenke.spec.ts"} 0
# HELP playwright_test_duration_seconds Duration of individual testcases in seconds
# TYPE playwright_test_duration_seconds gauge
playwright_test_duration_seconds{browser="chromium",deploy_env="at23",language="bokmål",status="passed",suite="apps/innsending.spec.ts",test="Bruker sender inn skjema"} 20.91
playwright_test_duration_seconds{browser="chromium",deploy_env="at23",language="bokmål",status="skipped",suite="apps/innsending.spec.ts",test="Bruker sletter skjema"} 0
playwright_test_duration_seconds{browser="edge",deploy_env="at23",language="bokmål",status="failed",suite="apps/innsending.spec.ts",test="Bruker sender inn skjema"} 30.1
playwright_test_duration_seconds{browser="edge",deploy_env="at23",language="bokmål",status="passed",suite="apps/innsending.spec.ts",test="Bruker sletter skjema"} 5.1
playwright_test_duration_seconds{browser="edge",deploy_env="at23",language="bokmål",status="failed",suite="innlogging/dyplenke.spec.ts",test="Dyplenke › åpner innboksen"} 4.4
# HELP playwright_test_status Status of individual testcases (0=passed,1=failed,2=skipped)
# TYPE playwright_test_status gauge
playwright_test_status{browser="chromium",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts",test="Bruker sender inn skjema"} 0
playwright_test_status{browser="chromium",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts",test="Bruker sletter skjema"} 2
playwright_test_status{browser="edge",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts",test="Bruker sender inn skjema"} 1
playwright_test_status{browser="edge",deploy_env="at23",language="bokmål",suite="apps/innsending.spec.ts",test="Bruker sletter skjema"} 0
playwright_test_status{browser="edge",deploy_env="at23",language="bokmål",suite="innlogging/dyplenke.spec.ts",test="Dyplenke › åpner innboksen"} 1
# HELP playwright_test_run_timestamp_seconds Unix timestamp of the latest Playwright test run
# TYPE playwright_test_run_timestamp_seconds gauge
playwright_test_run_timestamp_seconds{deploy_env="at23"} 1793350000
# HELP playwright_test_run_status Status of the latest Playwright test run (0=passed,1=failed)
# TYPE playwright_test_run_status gauge
playwright_test_run_status{deploy_env="at23"} 1
`
	if err := testutil.GatherAndCompare(reg, strings.NewReader(want)); err != nil {
		t.Error(err)
	}
}

func TestPlaywrightPassedRun(t *testing.T) {
	report := playwright.JUnitReport{Suites: []playwright.JUnitSuite{{
		Name: "a.spec.ts", Hostname: "prod-chromium-bokmål", Tests: 1,
		TestCases: []playwright.JUnitTestCase{{Name: "logs in"}},
	}}}
	reg, failed := Playwright(report, "prod", runEnded, &bytes.Buffer{})
	if failed {
		t.Error("failed = true, want false")
	}
	want := `
# HELP playwright_test_run_status Status of the latest Playwright test run (0=passed,1=failed)
# TYPE playwright_test_run_status gauge
playwright_test_run_status{deploy_env="prod"} 0
`
	if err := testutil.GatherAndCompare(reg, strings.NewReader(want), "playwright_test_run_status"); err != nil {
		t.Error(err)
	}
}

// A test with a failure fails the run even if the counts on the suite say
// otherwise.
func TestPlaywrightFailedTestCaseFailsTheRun(t *testing.T) {
	report := playwright.JUnitReport{Suites: []playwright.JUnitSuite{{
		Name: "a.spec.ts", Hostname: "at23-chromium-bokmål", Tests: 1,
		TestCases: []playwright.JUnitTestCase{{Name: "logs in", Error: &struct{}{}}},
	}}}
	if _, failed := Playwright(report, "at23", runEnded, &bytes.Buffer{}); !failed {
		t.Error("failed = false, want true")
	}
}

func TestPlaywrightEmptyReportIsLogged(t *testing.T) {
	var log bytes.Buffer
	_, failed := Playwright(playwright.JUnitReport{}, "at23", runEnded, &log)
	if failed {
		t.Error("failed = true, want false")
	}
	if !strings.Contains(log.String(), "The report has no tests.") {
		t.Errorf("unexpected log:\n%s", log.String())
	}
}

func TestPlaywrightProjectNames(t *testing.T) {
	suite := func(hostname string) playwright.JUnitSuite {
		return playwright.JUnitSuite{Name: "a.spec.ts", Hostname: hostname, Tests: 1}
	}
	report := playwright.JUnitReport{Suites: []playwright.JUnitSuite{
		suite("native"),
		suite("native"),
		suite("at23-webkit"),
		suite("at23-chromium-nb-NO"),
		suite("tt02-edge-bokmål"),
	}}
	var log bytes.Buffer
	reg, _ := Playwright(report, "at23", runEnded, &log)

	want := `
# HELP playwright_tests_total Total number of tests in the suite
# TYPE playwright_tests_total gauge
playwright_tests_total{browser="unknown",deploy_env="at23",language="unknown",suite="a.spec.ts"} 1
playwright_tests_total{browser="webkit",deploy_env="at23",language="unknown",suite="a.spec.ts"} 1
playwright_tests_total{browser="chromium",deploy_env="at23",language="nb-NO",suite="a.spec.ts"} 1
playwright_tests_total{browser="edge",deploy_env="at23",language="bokmål",suite="a.spec.ts"} 1
`
	if err := testutil.GatherAndCompare(reg, strings.NewReader(want), "playwright_tests_total"); err != nil {
		t.Error(err)
	}

	got := log.String()
	for _, line := range []string{
		`The project "native" is not named <environment>-<browser>-<language>, as in playwright.config.ts. Its metrics get browser "unknown" and language "unknown".`,
		`The project "at23-webkit" is not named <environment>-<browser>-<language>, as in playwright.config.ts. Its metrics get browser "webkit" and language "unknown".`,
		`The project "tt02-edge-bokmål" is for tt02, but the run is for at23. Its metrics get deploy_env "at23".`,
	} {
		if strings.Count(got, line) != 1 {
			t.Errorf("want the line once in the log: %s\nlog:\n%s", line, got)
		}
	}
	if strings.Contains(got, "at23-chromium-nb-NO") {
		t.Errorf("a valid project name is logged:\n%s", got)
	}
}
