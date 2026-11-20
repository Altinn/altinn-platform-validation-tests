package cmd

import (
	"bytes"
	"errors"
	"strings"
	"testing"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
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
		// k6's own -e goes after --.
		{"k6", "generate", "smoke.yaml", "-e", "FOO=bar"},
	} {
		if _, err := execute(args...); err == nil {
			t.Errorf("%s: expected an error", strings.Join(args, " "))
		}
	}
}

// The arguments are checked before anything is generated, so these do not
// touch the file system.
func TestK6GenerateTakesOneConfigFile(t *testing.T) {
	for _, args := range [][]string{
		{"k6", "generate"},
		{"k6", "generate", "functional.yaml", "smoke.yaml"},
		{"k6", "generate", "--", "--vus", "3"},
	} {
		if _, err := execute(args...); !errors.Is(err, errs.Invalid) {
			t.Errorf("%s: expected errs.Invalid, got %v", strings.Join(args, " "), err)
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
