// Package metrics makes Prometheus metrics from test reports and pushes them
// to the Prometheus Pushgateway.
package metrics

import (
	"fmt"
	"io"
	"time"

	"github.com/prometheus/client_golang/prometheus"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/playwright"
)

// unknown is the browser or language of a project whose name does not have it.
const unknown = "unknown"

// The labels on the suite and test metrics. deploy_env is the environment the
// run is for, and is also in the grouping key when the metrics are pushed.
var (
	suiteLabels  = []string{"suite", "browser", "language", "deploy_env"}
	testLabels   = []string{"suite", "test", "status", "browser", "language", "deploy_env"}
	statusLabels = []string{"suite", "test", "browser", "language", "deploy_env"}
	runLabels    = []string{"deploy_env"}
)

// The value of playwright_test_status.
const (
	statusPassed  = 0
	statusFailed  = 1
	statusSkipped = 2
)

type playwrightMetrics struct {
	suiteDuration, suiteTotal, suitePassed, suiteFailed, suiteSkipped *prometheus.GaugeVec
	testDuration, testStatus                                          *prometheus.GaugeVec
	runTimestamp, runStatus                                           *prometheus.GaugeVec
}

func gauge(name, help string, labels []string) *prometheus.GaugeVec {
	return prometheus.NewGaugeVec(prometheus.GaugeOpts{Name: name, Help: help}, labels)
}

// newPlaywrightMetrics makes the metrics with the names and help texts from
// helpers/junitparser, so the dashboards and alerts work with either.
func newPlaywrightMetrics() playwrightMetrics {
	return playwrightMetrics{
		suiteDuration: gauge("playwright_suite_duration_seconds", "Duration of the test suite in seconds", suiteLabels),
		suiteTotal:    gauge("playwright_tests_total", "Total number of tests in the suite", suiteLabels),
		suitePassed:   gauge("playwright_tests_passed", "Total number of passed tests in the suite", suiteLabels),
		suiteFailed:   gauge("playwright_tests_failed_total", "Total number of failed tests in the suite (failures + errors)", suiteLabels),
		suiteSkipped:  gauge("playwright_tests_skipped_total", "Total number of skipped tests in the suite", suiteLabels),
		testDuration:  gauge("playwright_test_duration_seconds", "Duration of individual testcases in seconds", testLabels),
		testStatus:    gauge("playwright_test_status", "Status of individual testcases (0=passed,1=failed,2=skipped)", statusLabels),
		runTimestamp:  gauge("playwright_test_run_timestamp_seconds", "Unix timestamp of the latest Playwright test run", runLabels),
		runStatus:     gauge("playwright_test_run_status", "Status of the latest Playwright test run (0=passed,1=failed)", runLabels),
	}
}

func (m playwrightMetrics) collectors() []prometheus.Collector {
	return []prometheus.Collector{
		m.suiteDuration, m.suiteTotal, m.suitePassed, m.suiteFailed, m.suiteSkipped,
		m.testDuration, m.testStatus,
		m.runTimestamp, m.runStatus,
	}
}

// Playwright makes the metrics for a Playwright run from its JUnit report, in
// a registry of their own. env is the environment the run is for, and now is
// when it ended. failed is true if at least one test failed.
//
// A spec file that runs in several projects gets one series per browser and
// language, from the project name. A project name that does not have them
// gives the label unknown, and a project for another environment than env is
// still counted for env. Both are logged, once per project.
func Playwright(report playwright.JUnitReport, env string, now time.Time, log io.Writer) (reg *prometheus.Registry, failed bool) {
	m := newPlaywrightMetrics()
	reg = prometheus.NewRegistry()
	reg.MustRegister(m.collectors()...)

	logged := map[string]bool{}
	for _, s := range report.Suites {
		browser, language := projectLabels(s.Hostname, env, logged, log)

		failedTests := s.Failures + s.Errors
		// Protects against a malformed report.
		passed := max(s.Tests-failedTests-s.Skipped, 0)
		if failedTests > 0 {
			failed = true
		}

		m.suiteDuration.WithLabelValues(s.Name, browser, language, env).Set(s.Time)
		m.suiteTotal.WithLabelValues(s.Name, browser, language, env).Set(float64(s.Tests))
		m.suitePassed.WithLabelValues(s.Name, browser, language, env).Set(float64(passed))
		m.suiteFailed.WithLabelValues(s.Name, browser, language, env).Set(float64(failedTests))
		m.suiteSkipped.WithLabelValues(s.Name, browser, language, env).Set(float64(s.Skipped))

		for _, tc := range s.TestCases {
			status, value := "passed", statusPassed
			switch {
			case tc.Failed():
				failed = true
				status, value = "failed", statusFailed
			case tc.Skipped != nil:
				status, value = "skipped", statusSkipped
			}
			m.testDuration.WithLabelValues(s.Name, tc.Name, status, browser, language, env).Set(tc.Time)
			m.testStatus.WithLabelValues(s.Name, tc.Name, browser, language, env).Set(float64(value))
		}
	}

	if len(report.Suites) == 0 {
		fmt.Fprintln(log, "The report has no tests. The run is counted as passed.")
	}
	m.runTimestamp.WithLabelValues(env).Set(float64(now.Unix()))
	runStatus := 0.0
	if failed {
		runStatus = 1
	}
	m.runStatus.WithLabelValues(env).Set(runStatus)
	return reg, failed
}

// projectLabels gives the browser and language labels for a project, and logs
// what is wrong with the project name the first time it is seen.
func projectLabels(name, env string, logged map[string]bool, log io.Writer) (browser, language string) {
	p := playwright.ParseProject(name)
	browser, language = orUnknown(p.Browser), orUnknown(p.Language)
	if logged[name] {
		return browser, language
	}
	logged[name] = true
	if p.Browser == "" || p.Language == "" {
		fmt.Fprintf(log, "The project %q is not named <environment>-<browser>-<language>, as in playwright.config.ts. Its metrics get browser %q and language %q.\n", name, browser, language)
	}
	if p.Env != "" && p.Env != env {
		fmt.Fprintf(log, "The project %q is for %s, but the run is for %s. Its metrics get deploy_env %q.\n", name, p.Env, env, env)
	}
	return browser, language
}

func orUnknown(s string) string {
	if s == "" {
		return unknown
	}
	return s
}
