package playwright

import (
	"encoding/xml"
	"fmt"
	"strings"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// JUnitReport is the JUnit report from Playwright. It has one suite per spec
// file and project, so a file that runs in two browsers gives two suites with
// the same name.
type JUnitReport struct {
	XMLName xml.Name     `xml:"testsuites"`
	Suites  []JUnitSuite `xml:"testsuite"`
}

// JUnitSuite is a spec file run in one project. Name is the path of the file
// below the test folder, and Hostname is the name of the project. Failures and
// Errors are counted apart, but both are failed tests.
type JUnitSuite struct {
	Name      string          `xml:"name,attr"`
	Hostname  string          `xml:"hostname,attr"`
	Tests     int             `xml:"tests,attr"`
	Failures  int             `xml:"failures,attr"`
	Errors    int             `xml:"errors,attr"`
	Skipped   int             `xml:"skipped,attr"`
	Time      float64         `xml:"time,attr"`
	TestCases []JUnitTestCase `xml:"testcase"`
}

// JUnitTestCase is a test. The error messages are not read, since they can
// contain test data from prod.
type JUnitTestCase struct {
	Name    string    `xml:"name,attr"`
	Time    float64   `xml:"time,attr"`
	Failure *struct{} `xml:"failure"`
	Error   *struct{} `xml:"error"`
	Skipped *struct{} `xml:"skipped"`
}

// Failed is true if the test has a failure or an error.
func (tc JUnitTestCase) Failed() bool {
	return tc.Failure != nil || tc.Error != nil
}

// ParseJUnit reads a JUnit report.
func ParseJUnit(data []byte) (JUnitReport, error) {
	var r JUnitReport
	if err := xml.Unmarshal(data, &r); err != nil {
		return JUnitReport{}, fmt.Errorf("%w: Playwright JUnit report: %v", errs.Invalid, err)
	}
	return r, nil
}

// Project is the name of a Playwright project split into its parts.
// playwright.config.ts names the projects ${miljo}-${nettleser}-${sprak}, for
// example at23-chromium-bokmål. A part that is not in the name is empty.
type Project struct {
	Env      string
	Browser  string
	Language string
}

// ParseProject splits a project name. The environment and the browser cannot
// contain a hyphen, but the language can: at23-chromium-nb-NO has the language
// nb-NO. A name without a hyphen is not split, since it is not known which part
// it would be.
func ParseProject(name string) Project {
	parts := strings.SplitN(name, "-", 3)
	switch len(parts) {
	case 3:
		return Project{Env: parts[0], Browser: parts[1], Language: parts[2]}
	case 2:
		return Project{Env: parts[0], Browser: parts[1]}
	default:
		return Project{}
	}
}
