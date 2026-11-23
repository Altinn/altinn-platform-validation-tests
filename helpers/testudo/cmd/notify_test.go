package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/playwright"
)

func TestFailedMessageListsFiveTests(t *testing.T) {
	summary := playwright.Summary{Ran: 20}
	for i := 1; i <= 7; i++ {
		summary.Failed = append(summary.Failed, fmt.Sprintf("test %d", i))
	}
	got := failedMessage(summary, "prod", "https://rapport")
	want := ":red_circle: *Produksjon*: 7 av 20 Playwright-tester feilet\n" +
		"• test 1\n• test 2\n• test 3\n• test 4\n• test 5\n" +
		"…og 2 til, se rapporten\n" +
		"Rapport: https://rapport"
	if got != want {
		t.Errorf("got\n%s\nwant\n%s", got, want)
	}
}

func TestFailedMessageEscapesTitles(t *testing.T) {
	got := failedMessage(playwright.Summary{Ran: 1, Failed: []string{"<a> & <b>"}}, "at23", "")
	if !strings.Contains(got, "• &lt;a&gt; &amp; &lt;b&gt;") {
		t.Errorf("title is not escaped:\n%s", got)
	}
}

func TestNotifyPlaywrightDryRun(t *testing.T) {
	report := filepath.Join(t.TempDir(), "test-results.json")
	if err := os.WriteFile(report, []byte(`{"suites": [{"specs": [
		{"title": "logger inn", "file": "a.spec.ts", "ok": false, "tests": [{"status": "unexpected"}]}
	]}]}`), 0o600); err != nil {
		t.Fatal(err)
	}
	out, err := execute("notify", "playwright", "--env", "at23", "--report", report, "--report-url", "https://rapport", "--dry-run")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(out, "*at23*: 1 av 1 Playwright-tester feilet\n• logger inn\nRapport: https://rapport") {
		t.Errorf("unexpected message:\n%s", out)
	}
}

func TestNotifyPlaywrightWithoutReportSaysNotStarted(t *testing.T) {
	out, err := execute("notify", "playwright", "--env", "tt02", "--report", filepath.Join(t.TempDir(), "missing.json"), "--playwright-exit", "1", "--dry-run")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(out, ":warning: *tt02*: Playwright-kjøringen kom ikke i gang (exit 1).") {
		t.Errorf("unexpected message:\n%s", out)
	}
}

func TestNotifyPlaywrightRequiresEnv(t *testing.T) {
	if _, err := execute("notify", "playwright", "--dry-run"); err == nil {
		t.Error("expected an error without --env")
	}
}
