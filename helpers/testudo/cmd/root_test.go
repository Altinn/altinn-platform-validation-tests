package cmd

import (
	"bytes"
	"slices"
	"strings"
	"testing"

	"github.com/spf13/cobra"
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

// The slim build has only the commands for finding test data and version, so
// a command added to the full build does not end up in it by accident.
func TestCommands(t *testing.T) {
	want := map[string][]string{
		"full": {"find", "k6", "notify", "serve", "version"},
		"slim": {"find", "version"},
	}[variant]
	var got []string
	for _, c := range newRootCmd().Commands() {
		got = append(got, c.Name())
	}
	if !slices.Equal(got, want) {
		t.Errorf("the %s build has the commands %v, expected %v", variant, got, want)
	}
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

func TestDefaultEnvIsAt23(t *testing.T) {
	for _, cmd := range []*cobra.Command{newPersonsCmd(), newOrganizationsCmd()} {
		if got := cmd.Flags().Lookup("env").DefValue; got != "at23" {
			t.Errorf("%s: --env defaults to %q", cmd.Name(), got)
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
