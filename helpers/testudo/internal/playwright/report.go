// Package playwright reads the JSON report from Playwright.
package playwright

import (
	"encoding/json"
	"fmt"
	"slices"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

type report struct {
	Suites []suite `json:"suites"`
}

type suite struct {
	Suites []suite `json:"suites"`
	Specs  []spec  `json:"specs"`
}

type spec struct {
	Title string `json:"title"`
	File  string `json:"file"`
	OK    bool   `json:"ok"`
	Tests []test `json:"tests"`
}

type test struct {
	Status string `json:"status"`
}

// Summary is the result of a run. Failed has the titles of the failed tests,
// in the order they appear in the report.
type Summary struct {
	Ran    int
	Failed []string
}

// Summarize reads a JSON report. The report has one suite per project, so a
// test is counted once however many browsers it ran in, and is failed if it
// failed in at least one. Tests that were skipped everywhere are not counted.
func Summarize(data []byte) (Summary, error) {
	var r report
	if err := json.Unmarshal(data, &r); err != nil {
		return Summary{}, fmt.Errorf("%w: Playwright report: %v", errs.Invalid, err)
	}
	ran := map[string]bool{}
	var failed []string
	walk(r.Suites, ran, &failed)
	return Summary{Ran: len(ran), Failed: failed}, nil
}

func walk(suites []suite, ran map[string]bool, failed *[]string) {
	for _, s := range suites {
		walk(s.Suites, ran, failed)
		for _, sp := range s.Specs {
			if !slices.ContainsFunc(sp.Tests, func(t test) bool { return t.Status != "skipped" }) {
				continue
			}
			ran[sp.File+"\x00"+sp.Title] = true
			if !sp.OK && !slices.Contains(*failed, sp.Title) {
				*failed = append(*failed, sp.Title)
			}
		}
	}
}
