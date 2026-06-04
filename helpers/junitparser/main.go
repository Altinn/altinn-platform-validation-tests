package main

import (
	"encoding/xml"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/push"
)

type TestSuites struct {
	XMLName  xml.Name `xml:"testsuites"`
	ID       string   `xml:"id,attr"`   // Doesn't look like this is set
	Name     string   `xml:"name,attr"` // Doesn't look like this is set
	Tests    int      `xml:"tests,attr"`
	Failures int      `xml:"failures,attr"` // Test ran, assertion failed
	Skipped  int      `xml:"skipped,attr"`
	Errors   int      `xml:"errors,attr"` // Test did not complete due to unexpected issue
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

	SystemOut string `xml:"system-out"` // Not worth parsing

	Failure *Failure `xml:"failure"`
	Error   *Error   `xml:"error"`
	Skipped *Skipped `xml:"skipped"`
}

type Failure struct {
	Message string `xml:"message,attr"`
	Type    string `xml:"type,attr"`
	Text    string `xml:",chardata"`
}

type Error struct {
	Message string `xml:"message,attr"`
	Type    string `xml:"type,attr"`
	Text    string `xml:",chardata"` // Not worth parsing
}

type Skipped struct {
	Message string `xml:"message,attr"`
}

var (
	suiteDuration = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_suite_duration_seconds",
			Help: "Duration of the test suite in seconds",
		},
		[]string{"suite"},
	)
	suiteTotal = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_tests_total",
			Help: "Total number of tests in the suite",
		},
		[]string{"suite"},
	)
	suiteFailed = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_tests_failed_total",
			Help: "Total number of failed tests in the suite (failures + errors)",
		},
		[]string{"suite"},
	)
	suiteSkipped = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_tests_skipped_total",
			Help: "Total number of skipped tests in the suite",
		},
		[]string{"suite"},
	)
	testDuration = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_test_duration_seconds",
			Help: "Duration of individual testcases in seconds",
		},
		[]string{"suite", "test", "status"},
	)
	testStatus = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "playwright_test_status",
			Help: "Status of individual testcases (0=passed,1=failed,2=skipped)",
		},
		[]string{"suite", "test"},
	)
)

func parseJUnit(file string) {
	data, err := os.ReadFile(file)
	if err != nil {
		log.Fatal(err)
	}

	var testSuites TestSuites

	if err := xml.Unmarshal(data, &testSuites); err != nil {
		log.Fatal(err)
	}

	for _, suite := range testSuites.TestSuites {
		fmt.Println(suite.Name)
		suiteDuration.WithLabelValues(suite.Name).Set(suite.Time)
		suiteTotal.WithLabelValues(suite.Name).Set(float64(suite.Tests))
		suiteFailed.WithLabelValues(suite.Name).Set(float64(suite.Failures + suite.Errors))
		suiteSkipped.WithLabelValues(suite.Name).Set(float64(suite.Skipped))

		for _, tc := range suite.TestCases {
			status := "passed"
			statusValue := 0.0
			if tc.Failure != nil || tc.Error != nil {
				status = "failed"
				statusValue = 1
			} else if tc.Skipped != nil {
				status = "skipped"
				statusValue = 2
			}

			testDuration.WithLabelValues(suite.Name, tc.Name, status).Set(tc.Time)
			testStatus.WithLabelValues(suite.Name, tc.Name).Set(statusValue)
		}
	}
}

func main() {
	xmlFile := flag.String("xml", "test-results.xml", "Path to JUnit XML file")
	promPushGatewayEndpoint := flag.String("prometheus-pushgateway-endpoint", "http://prometheus-pushgateway.monitoring:9091", "The Prometheus Push Gateway Endpoint")
	flag.Parse()

	reg := prometheus.NewRegistry()
	reg.MustRegister(suiteDuration, suiteTotal, suiteFailed, suiteSkipped, testDuration, testStatus)

	parseJUnit(*xmlFile)
	/*
		http.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{}))
		log.Println("Serving metrics on :8080/metrics")
		log.Fatal(http.ListenAndServe(":8080", nil))
	*/

	if err := push.New(*promPushGatewayEndpoint, "playwright_tests").
		Gatherer(reg).
		Push(); err != nil {
		log.Fatalf("Could not push metrics: %v", err)
	}

	log.Println("Metrics successfully pushed to Pushgateway")

}
