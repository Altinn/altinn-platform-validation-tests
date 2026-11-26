package playwright

import (
	"errors"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

const junitReport = `<testsuites id="" name="" tests="3" failures="1" skipped="1" errors="0" time="12.5">
<testsuite name="a.spec.ts" timestamp="2026-10-30T10:35:18.886Z" hostname="at23-chromium-bokmål" tests="3" failures="1" skipped="1" time="12.5" errors="0">
<testcase name="logs in" classname="a.spec.ts" time="2.5">
</testcase>
<testcase name="switches language" classname="a.spec.ts" time="10">
<failure message="a.spec.ts:8:5 switches language" type="FAILURE">
<![CDATA[  Error: expect(locator).toBeVisible() failed
]]>
</failure>
</testcase>
<testcase name="webkit only" classname="a.spec.ts" time="0">
<skipped>
</skipped>
</testcase>
</testsuite>
</testsuites>`

func TestParseJUnit(t *testing.T) {
	r, err := ParseJUnit([]byte(junitReport))
	if err != nil {
		t.Fatal(err)
	}
	if len(r.Suites) != 1 {
		t.Fatalf("got %d suites, want 1", len(r.Suites))
	}
	s := r.Suites[0]
	if s.Name != "a.spec.ts" || s.Hostname != "at23-chromium-bokmål" || s.Tests != 3 || s.Failures != 1 || s.Skipped != 1 || s.Time != 12.5 {
		t.Errorf("unexpected suite: %+v", s)
	}
	if len(s.TestCases) != 3 {
		t.Fatalf("got %d test cases, want 3", len(s.TestCases))
	}
	passed, failed, skipped := s.TestCases[0], s.TestCases[1], s.TestCases[2]
	if passed.Name != "logs in" || passed.Time != 2.5 || passed.Failed() || passed.Skipped != nil {
		t.Errorf("unexpected passed test: %+v", passed)
	}
	if !failed.Failed() || failed.Skipped != nil {
		t.Errorf("unexpected failed test: %+v", failed)
	}
	if skipped.Failed() || skipped.Skipped == nil {
		t.Errorf("unexpected skipped test: %+v", skipped)
	}
}

func TestParseJUnitInvalid(t *testing.T) {
	for _, data := range []string{`not xml`, `{"suites": []}`, `<testsuite name="a.spec.ts"></testsuite>`} {
		if _, err := ParseJUnit([]byte(data)); !errors.Is(err, errs.Invalid) {
			t.Errorf("%s: got %v, want errs.Invalid", data, err)
		}
	}
}

func TestParseProject(t *testing.T) {
	tests := []struct {
		name string
		want Project
	}{
		{"at23-chromium-bokmål", Project{Env: "at23", Browser: "chromium", Language: "bokmål"}},
		{"tt02-edge-nynorsk", Project{Env: "tt02", Browser: "edge", Language: "nynorsk"}},
		{"prod-webkit-engelsk", Project{Env: "prod", Browser: "webkit", Language: "engelsk"}},
		{"at23-chromium-nb-NO", Project{Env: "at23", Browser: "chromium", Language: "nb-NO"}},
		{"at23-chromium", Project{Env: "at23", Browser: "chromium"}},
		{"native", Project{}},
		{"", Project{}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := ParseProject(tt.name); got != tt.want {
				t.Errorf("ParseProject(%q) = %+v, want %+v", tt.name, got, tt.want)
			}
		})
	}
}
