package main

import (
	"encoding/xml"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/push"
)

type TestSuites struct {
	XMLName  xml.Name `xml:"testsuites"`
	ID       string   `xml:"id,attr"`
	Name     string   `xml:"name,attr"`
	Tests    int      `xml:"tests,attr"`
	Failures int      `xml:"failures,attr"`
	Skipped  int      `xml:"skipped,attr"`
	Errors   int      `xml:"errors,attr"`
	Time     float64  `xml:"time,attr"`

	TestSuites []TestSuite `xml:"testsuite"`
}

type TestSuite struct {
	XMLName   xml.Name `xml:"testsuite"`
	Name      string   `xml:"name,attr"`
	Timestamp string   `xml:"timestamp,attr"`
	Hostname  string   `xml:"hostname,attr"`
	Tests     int      `xml:"tests,attr"`
	Failures  int      `xml:"failures,attr"`
	Skipped   int      `xml:"skipped,attr"`
	Time      float64  `xml:"time,attr"`
	Errors    int      `xml:"errors,attr"`

	TestCases []TestCase `xml:"testcase"`
}

type TestCase struct {
	Name      string  `xml:"name,attr"`
	ClassName string  `xml:"classname,attr"`
	Time      float64 `xml:"time,attr"`

	SystemOut string   `xml:"system-out"`
	Failure   *Failure `xml:"failure"`
	Error     *Error   `xml:"error"`
	Skipped   *Skipped `xml:"skipped"`
}

type Failure struct {
	Message string `xml:"message,attr"`
	Type    string `xml:"type,attr"`
	Text    string `xml:",chardata"`
}

type Error struct {
	Message string `xml:"message,attr"`
	Type    string `xml:"type,attr"`
	Text    string `xml:",chardata"`
}

type Skipped struct {
	Message string `xml:"message,attr"`
}

var (
	// -------------------------------------------------------------------------
	// Suite-level metrics
	// -------------------------------------------------------------------------

	suiteDuration = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_suite_duration_seconds",
			Help: "Duration of the test suite in seconds",
		},
		[]string{"suite", "deploy_env"},
	)

	suiteTotal = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_tests_total",
			Help: "Total number of tests in the suite",
		},
		[]string{"suite", "deploy_env"},
	)

	suitePassed = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_tests_passed",
			Help: "Total number of passed tests in the suite",
		},
		[]string{"suite", "deploy_env"},
	)

	suiteFailed = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_tests_failed_total",
			Help: "Total number of failed tests in the suite (failures + errors)",
		},
		[]string{"suite", "deploy_env"},
	)

	suiteSkipped = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_tests_skipped_total",
			Help: "Total number of skipped tests in the suite",
		},
		[]string{"suite", "deploy_env"},
	)

	// -------------------------------------------------------------------------
	// Individual test metrics
	// -------------------------------------------------------------------------

	testDuration = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_test_duration_seconds",
			Help: "Duration of individual testcases in seconds",
		},
		[]string{"suite", "test", "status", "deploy_env"},
	)

	testStatus = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_test_status",
			Help: "Status of individual testcases (0=passed,1=failed,2=skipped)",
		},
		[]string{"suite", "test", "deploy_env"},
	)

	// -------------------------------------------------------------------------
	// Test-run-level metrics
	// -------------------------------------------------------------------------

	testRunTimestamp = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_test_run_timestamp_seconds",
			Help: "Unix timestamp of the latest Playwright test run",
		},
		[]string{"deploy_env"},
	)

	testRunStatus = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_test_run_status",
			Help: "Status of the latest Playwright test run (0=passed,1=failed)",
		},
		[]string{"deploy_env"},
	)
)

func parseJUnit(file string, deployEnv string) bool {
	data, err := os.ReadFile(file)
	if err != nil {
		log.Fatal(err)
	}

	var testSuites TestSuites

	if err := xml.Unmarshal(data, &testSuites); err != nil {
		log.Fatal(err)
	}

	hasFailedTests := false

	for _, suite := range testSuites.TestSuites {
		fmt.Println(suite.Name)

		// failures + errors are considered failed tests.
		failed := suite.Failures + suite.Errors

		// A passed test is one that wasn't failed or skipped.
		passed := suite.Tests - failed - suite.Skipped

		// Protect against malformed JUnit data.
		if passed < 0 {
			passed = 0
		}

		suiteDuration.WithLabelValues(
			suite.Name,
			deployEnv,
		).Set(suite.Time)

		suiteTotal.WithLabelValues(
			suite.Name,
			deployEnv,
		).Set(float64(suite.Tests))

		suitePassed.WithLabelValues(
			suite.Name,
			deployEnv,
		).Set(float64(passed))

		suiteFailed.WithLabelValues(
			suite.Name,
			deployEnv,
		).Set(float64(failed))

		suiteSkipped.WithLabelValues(
			suite.Name,
			deployEnv,
		).Set(float64(suite.Skipped))

		if failed > 0 {
			hasFailedTests = true
		}

		for _, tc := range suite.TestCases {
			status := "passed"
			statusValue := 0.0

			if tc.Failure != nil || tc.Error != nil {
				hasFailedTests = true
				status = "failed"
				statusValue = 1
			} else if tc.Skipped != nil {
				status = "skipped"
				statusValue = 2
			}

			testDuration.WithLabelValues(
				suite.Name,
				tc.Name,
				status,
				deployEnv,
			).Set(tc.Time)

			testStatus.WithLabelValues(
				suite.Name,
				tc.Name,
				deployEnv,
			).Set(statusValue)
		}
	}

	return hasFailedTests
}

func main() {
	xmlFile := flag.String(
		"xml",
		"test-results.xml",
		"Path to JUnit XML file",
	)

	promPushGatewayEndpoint := flag.String(
		"prometheus-pushgateway-endpoint",
		"http://prometheus-pushgateway.monitoring:9091",
		"The Prometheus Push Gateway Endpoint",
	)

	flag.Parse()

	deployEnv := os.Getenv("DEPLOY_ENV")
	if deployEnv == "" {
		log.Fatal("DEPLOY_ENV environment variable is not set")
	}

	reg := prometheus.NewRegistry()

	reg.MustRegister(
		// Suite metrics
		suiteDuration,
		suiteTotal,
		suitePassed,
		suiteFailed,
		suiteSkipped,

		// Test metrics
		testDuration,
		testStatus,

		// Run metrics
		testRunTimestamp,
		testRunStatus,
	)

	hasFailedTests := parseJUnit(*xmlFile, deployEnv)

	/*
		http.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{}))
		log.Println("Serving metrics on :8080/metrics")
		log.Fatal(http.ListenAndServe(":8080", nil))
	*/

	// Record when this test run completed.
	testRunTimestamp.
		WithLabelValues(deployEnv).
		Set(float64(time.Now().Unix()))

	// 0 = passed, 1 = failed.
	runStatus := 0.0
	if hasFailedTests {
		runStatus = 1.0
	}

	testRunStatus.
		WithLabelValues(deployEnv).
		Set(runStatus)

	if err := push.New(*promPushGatewayEndpoint, "playwright_tests").
		Gatherer(reg).
		Push(); err != nil {
		log.Fatalf("Could not push metrics: %v", err)
	}

	log.Println("Metrics successfully pushed to Pushgateway")

	if hasFailedTests {
		os.Exit(53)
	}
}
