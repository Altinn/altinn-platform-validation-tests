package main

import (
	"testing"

	"github.com/prometheus/client_golang/prometheus/testutil"
)

func TestGetBrowserAndLanguage(t *testing.T) {
	tests := []struct {
		hostname string
		browser  string
		language string
	}{
		// Project names from playwright.config.ts: ${miljo}-${nettleser}-${sprak}.
		{"at23-chromium-bokmål", "chromium", "bokmål"},
		{"tt02-edge-nynorsk", "edge", "nynorsk"},
		{"prod-webkit-engelsk", "webkit", "engelsk"},
		{"at23-firefox-bokmål", "firefox", "bokmål"},
		{"native", "unknown", "unknown"},
		{"", "unknown", "unknown"},
	}

	for _, tt := range tests {
		browser, language := getBrowserAndLanguage(tt.hostname)
		if browser != tt.browser || language != tt.language {
			t.Errorf(
				"getBrowserAndLanguage(%q) = (%q, %q), want (%q, %q)",
				tt.hostname, browser, language, tt.browser, tt.language,
			)
		}
	}
}

func TestParseJUnitAddsBrowserAndLanguageLabels(t *testing.T) {
	hasFailedTests := parseJUnit("test-results-example.xml", "at23")

	if !hasFailedTests {
		t.Error("expected example report to contain failed tests")
	}

	// The same suite runs once per browser, so each must get its own series.
	for _, browser := range []string{"chromium", "edge", "webkit"} {
		got := testutil.ToFloat64(suiteTotal.WithLabelValues(
			"apps/innsending.spec.ts", browser, "bokmål", "at23",
		))
		if got != 1 {
			t.Errorf("suite total for %s = %v, want 1", browser, got)
		}
	}

	got := testutil.ToFloat64(testStatus.WithLabelValues(
		"apps/instansiereapp.spec.ts",
		"Bruker instansierer app og gir tilgang, med direktenavigasjon til appen",
		"chromium",
		"bokmål",
		"at23",
	))
	if got != 1 {
		t.Errorf("test status = %v, want 1 (failed)", got)
	}
}
