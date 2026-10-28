package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const maxListedTests = 10

type Report struct {
	Suites []Suite `json:"suites"`
	Stats  Stats   `json:"stats"`
}

type Suite struct {
	Suites []Suite `json:"suites"`
	Specs  []Spec  `json:"specs"`
}

type Spec struct {
	Title string `json:"title"`
	OK    bool   `json:"ok"`
}

type Stats struct {
	Expected   int `json:"expected"`
	Unexpected int `json:"unexpected"`
	Flaky      int `json:"flaky"`
}

func failedTests(suites []Suite) []string {
	var failed []string

	for _, suite := range suites {
		failed = append(failed, failedTests(suite.Suites)...)

		for _, spec := range suite.Specs {
			if !spec.OK {
				failed = append(failed, spec.Title)
			}
		}
	}

	return failed
}

func environmentName(environment string) string {
	if environment == "prod" {
		return "Produksjon"
	}

	return environment
}

// Bare testtitler, ikke feilmeldinger: de kan inneholde testdata fra prod.
func failedMessage(report Report, environment string, reportURL string) string {
	failed := failedTests(report.Suites)
	total := report.Stats.Expected + report.Stats.Unexpected + report.Stats.Flaky

	var b strings.Builder

	fmt.Fprintf(
		&b,
		":red_circle: *%s*: %d av %d Playwright-tester feilet",
		environmentName(environment),
		report.Stats.Unexpected,
		total,
	)

	for i, title := range failed {
		if i == maxListedTests {
			fmt.Fprintf(&b, "\n…og %d til", len(failed)-maxListedTests)
			break
		}

		fmt.Fprintf(&b, "\n• %s", title)
	}

	fmt.Fprintf(&b, "\nRapport: %s", reportURL)

	return b.String()
}

func notStartedMessage(environment string, playwrightExit int) string {
	return fmt.Sprintf(
		":warning: *%s*: Playwright-kjøringen kom ikke i gang (exit %d). Rapporten er tom, sjekk poddloggen.",
		environmentName(environment),
		playwrightExit,
	)
}

func send(webhookURL string, text string) error {
	payload, err := json.Marshal(map[string]string{"text": text})
	if err != nil {
		return err
	}

	client := http.Client{Timeout: 30 * time.Second}

	resp, err := client.Post(webhookURL, "application/json", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("slack svarte %s", resp.Status)
	}

	return nil
}

func main() {
	jsonFile := flag.String(
		"json",
		"test-results.json",
		"Path to Playwright JSON report",
	)

	environment := flag.String(
		"environment",
		"",
		"Environment the tests ran against",
	)

	reportURL := flag.String(
		"report-url",
		"",
		"URL to the published HTML report",
	)

	notStarted := flag.Bool(
		"not-started",
		false,
		"The run stopped before any tests ran, so the report is empty",
	)

	playwrightExit := flag.Int(
		"playwright-exit",
		0,
		"Exit code from Playwright, shown when -not-started is set",
	)

	dryRun := flag.Bool(
		"dry-run",
		false,
		"Print the message instead of sending it",
	)

	flag.Parse()

	if *environment == "" {
		log.Fatal("-environment is not set")
	}

	var text string

	if *notStarted {
		text = notStartedMessage(*environment, *playwrightExit)
	} else {
		data, err := os.ReadFile(*jsonFile)
		if err != nil {
			log.Fatal(err)
		}

		var report Report

		if err := json.Unmarshal(data, &report); err != nil {
			log.Fatal(err)
		}

		text = failedMessage(report, *environment, *reportURL)
	}

	if *dryRun {
		fmt.Println(text)
		return
	}

	webhookURL := os.Getenv("SLACK_WEBHOOK_URL")
	if webhookURL == "" {
		log.Fatal("SLACK_WEBHOOK_URL environment variable is not set")
	}

	if err := send(webhookURL, text); err != nil {
		log.Fatalf("Could not send Slack notification: %v", err)
	}

	log.Println("Slack notification sent")
}
