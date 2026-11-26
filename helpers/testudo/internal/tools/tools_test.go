package tools

import (
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

// onPath makes PATH a folder with only the program name in it.
func onPath(t *testing.T, name string) {
	t.Helper()
	dir := t.TempDir()
	file := name
	if runtime.GOOS == "windows" {
		file += ".exe"
	}
	if err := os.WriteFile(filepath.Join(dir, file), nil, 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", dir)
}

func TestRequire(t *testing.T) {
	onPath(t, "present")

	if err := Require("present"); err != nil {
		t.Errorf("present: expected no error, got %v", err)
	}
	if err := Require(); err != nil {
		t.Errorf("nothing: expected no error, got %v", err)
	}

	err := Require("present", "k6", "kubectl")
	if !errors.Is(err, exec.ErrNotFound) {
		t.Fatalf("expected exec.ErrNotFound, got %v", err)
	}
	msg := err.Error()
	for _, want := range []string{"k6 must be on PATH", "kubectl must be on PATH"} {
		if !strings.Contains(msg, want) {
			t.Errorf("expected %q in\n%s", want, msg)
		}
	}
	if strings.Contains(msg, "present") {
		t.Errorf("the program on PATH is among the errors:\n%s", msg)
	}
}
