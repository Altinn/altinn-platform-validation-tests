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

const maxListedTests = 5

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

type PostMessageRequest struct {
	Channel  string `json:"channel"`
	Text     string `json:"text"`
	ThreadTS string `json:"thread_ts,omitempty"`
}

type PostMessageResponse struct {
	OK    bool   `json:"ok"`
	Error string `json:"error"`
	TS    string `json:"ts"`
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

func bulletList(titles []string) string {
	var b strings.Builder

	for _, title := range titles {
		fmt.Fprintf(&b, "\n• %s", title)
	}

	return b.String()
}

// Bare testtitler, ikke feilmeldinger: de kan inneholde testdata fra prod.
// Hele lista legges i tråden når den er lengre enn maxListedTests.
func failedMessages(report Report, environment string, reportURL string) (string, string) {
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

	thread := ""

	if len(failed) > maxListedTests {
		b.WriteString(bulletList(failed[:maxListedTests]))
		fmt.Fprintf(&b, "\n…og %d til, se tråden", len(failed)-maxListedTests)
		thread = "Alle feilede tester:" + bulletList(failed)
	} else {
		b.WriteString(bulletList(failed))
	}

	fmt.Fprintf(&b, "\nRapport: %s", reportURL)

	return b.String(), thread
}

func notStartedMessage(environment string, playwrightExit int) string {
	return fmt.Sprintf(
		":warning: *%s*: Playwright-kjøringen kom ikke i gang (exit %d). Rapporten er tom, sjekk poddloggen.",
		environmentName(environment),
		playwrightExit,
	)
}

func postMessage(apiURL string, token string, message PostMessageRequest) (string, error) {
	payload, err := json.Marshal(message)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest(http.MethodPost, apiURL+"/chat.postMessage", bytes.NewReader(payload))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	req.Header.Set("Authorization", "Bearer "+token)

	client := http.Client{Timeout: 30 * time.Second}

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("slack svarte %s", resp.Status)
	}

	// Slack svarer 200 også ved feil, med ok=false og en feilkode.
	var result PostMessageResponse

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if !result.OK {
		return "", fmt.Errorf("slack svarte %s", result.Error)
	}

	return result.TS, nil
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

	slackAPIURL := flag.String(
		"slack-api-url",
		"https://slack.com/api",
		"The Slack Web API base URL",
	)

	dryRun := flag.Bool(
		"dry-run",
		false,
		"Print the messages instead of sending them",
	)

	flag.Parse()

	if *environment == "" {
		log.Fatal("-environment is not set")
	}

	var text, thread string

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

		text, thread = failedMessages(report, *environment, *reportURL)
	}

	if *dryRun {
		fmt.Println(text)

		if thread != "" {
			fmt.Println("--- tråd ---")
			fmt.Println(thread)
		}

		return
	}

	token := os.Getenv("SLACK_BOT_TOKEN")
	if token == "" {
		log.Fatal("SLACK_BOT_TOKEN environment variable is not set")
	}

	channel := os.Getenv("SLACK_CHANNEL_ID")
	if channel == "" {
		log.Fatal("SLACK_CHANNEL_ID environment variable is not set")
	}

	ts, err := postMessage(*slackAPIURL, token, PostMessageRequest{
		Channel: channel,
		Text:    text,
	})
	if err != nil {
		log.Fatalf("Could not send Slack notification: %v", err)
	}

	if thread != "" {
		if _, err := postMessage(*slackAPIURL, token, PostMessageRequest{
			Channel:  channel,
			Text:     thread,
			ThreadTS: ts,
		}); err != nil {
			log.Fatalf("Could not send the full list to the thread: %v", err)
		}
	}

	log.Println("Slack notification sent")
}
