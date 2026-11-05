package cmd

import (
	"bytes"
	"strings"
	"testing"
)

// execute runs testudo with args and returns the error and what it printed.
func execute(args ...string) (string, error) {
	root := newRootCmd()
	var out bytes.Buffer
	root.SetOut(&out)
	root.SetErr(&out)
	root.SetArgs(args)
	err := root.Execute()
	return out.String(), err
}

func TestSingleDashFlagsAreRejected(t *testing.T) {
	for _, args := range [][]string{
		{"find", "persons", "-n", "2"},
		{"find", "organizations", "-r", "revisor"},
	} {
		if _, err := execute(args...); err == nil {
			t.Errorf("%s: expected an error", strings.Join(args, " "))
		}
	}
}

func TestHelpHasNoShorthand(t *testing.T) {
	out, err := execute("find", "organizations", "--help")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(out, "--count") {
		t.Errorf("help does not list --count:\n%s", out)
	}
	for _, short := range []string{"-n,", "-r,", "-h,"} {
		if strings.Contains(out, short) {
			t.Errorf("help lists the shorthand %q:\n%s", short, out)
		}
	}
}
