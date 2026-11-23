package playwright

import (
	"errors"
	"slices"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// Two projects (browsers) with the same tests, as in a real report.
const twoBrowsers = `{"suites": [
  {"suites": [{"specs": [
    {"title": "logs in", "file": "a.spec.ts", "ok": true, "tests": [{"status": "expected"}]},
    {"title": "switches language", "file": "a.spec.ts", "ok": false, "tests": [{"status": "unexpected"}]},
    {"title": "webkit only", "file": "b.spec.ts", "ok": true, "tests": [{"status": "skipped"}]}
  ]}]},
  {"suites": [{"specs": [
    {"title": "logs in", "file": "a.spec.ts", "ok": false, "tests": [{"status": "unexpected"}]},
    {"title": "switches language", "file": "a.spec.ts", "ok": false, "tests": [{"status": "unexpected"}]},
    {"title": "webkit only", "file": "b.spec.ts", "ok": true, "tests": [{"status": "skipped"}]}
  ]}]}
]}`

func TestSummarizeCountsEachTestOnce(t *testing.T) {
	s, err := Summarize([]byte(twoBrowsers))
	if err != nil {
		t.Fatal(err)
	}
	if s.Ran != 2 {
		t.Errorf("Ran = %d, want 2", s.Ran)
	}
	if want := []string{"switches language", "logs in"}; !slices.Equal(s.Failed, want) {
		t.Errorf("Failed = %q, want %q", s.Failed, want)
	}
}

func TestSummarizeEmptyReport(t *testing.T) {
	s, err := Summarize([]byte(`{"suites": []}`))
	if err != nil {
		t.Fatal(err)
	}
	if s.Ran != 0 || len(s.Failed) != 0 {
		t.Errorf("got %+v, want nothing", s)
	}
}

func TestSummarizeInvalidJSON(t *testing.T) {
	if _, err := Summarize([]byte(`not json`)); !errors.Is(err, errs.Invalid) {
		t.Errorf("got %v, want errs.Invalid", err)
	}
}
