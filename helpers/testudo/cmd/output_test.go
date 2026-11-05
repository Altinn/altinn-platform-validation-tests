package cmd

import (
	"bytes"
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

type testRow struct{ a, b string }

var testColumns = []column[testRow]{
	{name: "a", value: func(r testRow) string { return r.a }},
	{name: "b", value: func(r testRow) string { return r.b }},
}

func TestEffectiveFormat(t *testing.T) {
	tests := []struct {
		format string
		json   bool
		want   string
	}{
		{"", false, formatText},
		{"", true, formatJSON},
		{"csv", true, formatCSV},
		{"text", true, formatText},
	}
	for _, tt := range tests {
		if got := (outputOptions{format: tt.format}).effectiveFormat(tt.json); got != tt.want {
			t.Errorf("%+v: got %q, want %q", tt, got, tt.want)
		}
	}
}

func TestValidateOutput(t *testing.T) {
	defaults := []string{"a"}
	tests := []struct {
		name    string
		o       outputOptions
		invalid string
	}{
		{"text", outputOptions{}, ""},
		{"csv with defaults", outputOptions{format: "csv"}, ""},
		{"csv with selected columns", outputOptions{format: "csv", columns: "a,b"}, ""},
		{"unknown format", outputOptions{format: "xml"}, "unknown --format"},
		{"columns without csv", outputOptions{columns: "a"}, "only works with --format csv"},
		{"unknown column", outputOptions{format: "csv", columns: "a,c"}, `unknown column "c", use one of a,b`},
	}
	for _, tt := range tests {
		err := validateOutput(tt.o, false, testColumns, defaults)
		if tt.invalid == "" {
			if err != nil {
				t.Errorf("%s: %v", tt.name, err)
			}
			continue
		}
		if !errors.Is(err, errs.Invalid) || !strings.Contains(err.Error(), tt.invalid) {
			t.Errorf("%s: err = %v", tt.name, err)
		}
	}
}

func TestWriteCSV(t *testing.T) {
	columns, err := selectColumns(testColumns, " b , a", nil)
	if err != nil {
		t.Fatal(err)
	}
	var buf bytes.Buffer
	skipped, err := writeCSV(&buf, []testRow{{"1", "x"}, {"2", ""}, {"with,comma", "y"}}, columns)
	if err != nil {
		t.Fatal(err)
	}
	if skipped != 1 {
		t.Errorf("skipped = %d", skipped)
	}
	if buf.String() != "b,a\nx,1\ny,\"with,comma\"\n" {
		t.Errorf("csv = %q", buf.String())
	}
}

func TestWithOutFile(t *testing.T) {
	var stdout, log bytes.Buffer
	write := func(out io.Writer) error { _, err := out.Write([]byte("content")); return err }

	if err := withOutFile("", &stdout, &log, write); err != nil || stdout.String() != "content" {
		t.Errorf("stdout = %q, err = %v", stdout.String(), err)
	}

	path := filepath.Join(t.TempDir(), "out.csv")
	stdout.Reset()
	if err := withOutFile(path, &stdout, &log, write); err != nil {
		t.Fatal(err)
	}
	if b, _ := os.ReadFile(path); string(b) != "content" || stdout.Len() != 0 {
		t.Errorf("file = %q, stdout = %q", b, stdout.String())
	}
	if !strings.Contains(log.String(), "Wrote the result to "+path) {
		t.Errorf("log = %q", log.String())
	}

	// Missing folders are created.
	nested := filepath.Join(t.TempDir(), "a", "b", "out.csv")
	if err := withOutFile(nested, &stdout, &log, write); err != nil {
		t.Fatal(err)
	}
	if b, _ := os.ReadFile(nested); string(b) != "content" {
		t.Errorf("file in new folder = %q", b)
	}

	// An error along the way leaves no file.
	failPath := filepath.Join(t.TempDir(), "fail.csv")
	err := withOutFile(failPath, &stdout, &log, func(out io.Writer) error {
		out.Write([]byte("half"))
		return errors.New("boom")
	})
	if err == nil {
		t.Fatal("expected an error")
	}
	if _, err := os.Stat(failPath); !os.IsNotExist(err) {
		t.Errorf("file was written although the run failed: %v", err)
	}
}
