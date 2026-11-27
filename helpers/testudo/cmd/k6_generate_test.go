//go:build !slim

package cmd

import (
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// k6's own flags, such as -e, go after --.
func TestK6GenerateRejectsSingleDashFlags(t *testing.T) {
	if _, err := execute("k6", "generate", "smoke.yaml", "-e", "FOO=bar"); err == nil {
		t.Error("expected an error")
	}
}

// The arguments are checked before anything is generated, so these do not
// touch the file system.
func TestK6GenerateTakesOneConfigFile(t *testing.T) {
	for _, args := range [][]string{
		{"k6", "generate"},
		{"k6", "generate", "functional.yaml", "smoke.yaml"},
		{"k6", "generate", "--", "--vus", "3"},
		{"k6", "generate", "--cronjobs-only"},
		{"k6", "generate", "--cronjobs-only", "smoke.yaml", "--", "--vus", "3"},
		{"k6", "generate", "--slack", "prod", "smoke.yaml"},
		{"k6", "generate", "--slack", "", "smoke.yaml"},
		{"k6", "generate", "--parallel", "0", "smoke.yaml"},
		{"k6", "generate", "--parallel", "-2", "smoke.yaml"},
		{"k6", "generate", "--cronjobs-only", "--parallel", "4", "smoke.yaml"},
	} {
		if _, err := execute(args...); !errors.Is(err, errs.Invalid) {
			t.Errorf("%s: expected errs.Invalid, got %v", strings.Join(args, " "), err)
		}
	}
}

func TestK6GenerateRequiresK6(t *testing.T) {
	// The command empties .conf, .build, .dist and .cronjobs where it runs.
	dir := t.TempDir()
	t.Chdir(dir)
	keep := filepath.Join(dir, ".dist", "keep")
	if err := os.MkdirAll(filepath.Dir(keep), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(keep, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", t.TempDir())

	out, err := execute("k6", "generate", "smoke.yaml")
	if !errors.Is(err, exec.ErrNotFound) || !strings.Contains(err.Error(), "k6 must be on PATH") {
		t.Errorf("expected k6 to be missing, got %v", err)
	}
	if strings.Contains(out, "Usage:") {
		t.Errorf("a missing k6 printed the help text:\n%s", out)
	}
	if _, err := os.Stat(keep); err != nil {
		t.Errorf("the folders were emptied before k6 was checked: %v", err)
	}

	// The CronJobs are made without k6, so the error is the missing file.
	if _, err := execute("k6", "generate", "--cronjobs-only", "smoke.yaml"); err == nil || errors.Is(err, exec.ErrNotFound) {
		t.Errorf("--cronjobs-only: expected the config file to be missing, got %v", err)
	}
}
