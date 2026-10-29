package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"slices"
	"strings"
	"time"
)

const maxListedTests = 5

type Report struct {
	Suites []Suite `json:"suites"`
}

type Suite struct {
	Suites []Suite `json:"suites"`
	Specs  []Spec  `json:"specs"`
}

type Spec struct {
	Title string `json:"title"`
	File  string `json:"file"`
	OK    bool   `json:"ok"`
	Tests []Test `json:"tests"`
}

type Test struct {
	Status string `json:"status"`
}

type Summary struct {
	ran    map[string]bool
	failed []string
}

// Rapporten har én suite per project. En test telles én gang uansett hvor mange
// nettlesere den kjørte i, og regnes som feilet hvis den feilet i minst én.
func summarize(suites []Suite, summary *Summary) {
	for _, suite := range suites {
		summarize(suite.Suites, summary)

		for _, spec := range suite.Specs {
			if !slices.ContainsFunc(spec.Tests, func(t Test) bool { return t.Status != "skipped" }) {
				continue
			}

			summary.ran[spec.File+spec.Title] = true

			if !spec.OK && !slices.Contains(summary.failed, spec.Title) {
				summary.failed = append(summary.failed, spec.Title)
			}
		}
	}
}

func escape(text string) string {
	return strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;").Replace(text)
}

func environmentName(environment string) string {
	if environment == "prod" {
		return "Produksjon"
	}

	return environment
}

// Bare testtitler, ikke feilmeldinger: de kan inneholde testdata fra prod.
func failedMessage(summary Summary, environment string, reportURL string) string {
	var b strings.Builder

	fmt.Fprintf(
		&b,
		":red_circle: *%s*: %d av %d Playwright-tester feilet",
		environmentName(environment),
		len(summary.failed),
		len(summary.ran),
	)

	for i, title := range summary.failed {
		if i == maxListedTests {
			fmt.Fprintf(&b, "\n…og %d til, se rapporten", len(summary.failed)-maxListedTests)
			break
		}

		fmt.Fprintf(&b, "\n• %s", escape(title))
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

	playwrightExit := flag.Int(
		"playwright-exit",
		0,
		"Exit code from Playwright, shown when no tests ran",
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

	// En globalSetup som stopper kjøringen gir en rapport uten kjørte tester.
	// Krasjer Playwright før rapporten skrives, finnes den ikke i det hele tatt.
	text := notStartedMessage(*environment, *playwrightExit)

	data, err := os.ReadFile(*jsonFile)
	if err != nil {
		log.Printf("Could not read the report: %v", err)
	} else {
		var report Report

		if err := json.Unmarshal(data, &report); err != nil {
			log.Printf("Could not parse the report: %v", err)
		} else {
			summary := Summary{ran: map[string]bool{}}
			summarize(report.Suites, &summary)

			if len(summary.ran) > 0 {
				text = failedMessage(summary, *environment, *reportURL)
			}
		}
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
