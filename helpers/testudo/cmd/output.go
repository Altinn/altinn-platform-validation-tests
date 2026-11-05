package cmd

// Shared output for commands that print rows: text, JSON or CSV with optional
// columns. The column names follow the canonical schema in
// https://github.com/Altinn/altinn-platform-validation-tests/issues/323.

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"slices"
	"strings"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
)

const (
	formatText = "text"
	formatJSON = "json"
	formatCSV  = "csv"
)

// outputOptions are the output flags.
type outputOptions struct {
	// format is text, json or csv. Empty means the default: text, or json
	// with --json.
	format string
	// columns are comma-separated CSV columns. Empty means the command's
	// default.
	columns string
	// out is the file the result is written to. Empty means stdout.
	out string
}

func addOutputFlags(cmd *cobra.Command, o *outputOptions, defaultColumns []string) {
	cmd.Flags().StringVar(
		&o.format, "format", "",
		"Output: text, json or csv (default: text, or json with --json)",
	)
	cmd.Flags().StringVar(
		&o.columns, "columns", "",
		"Comma-separated columns with --format csv (default: "+strings.Join(defaultColumns, ",")+")",
	)
	cmd.Flags().StringVar(
		&o.out, "out", "",
		"File the result is written to (default: stdout)",
	)
}

// effectiveFormat decides the format when --format is not set.
func (o outputOptions) effectiveFormat(jsonOutput bool) string {
	switch {
	case o.format != "":
		return o.format
	case jsonOutput:
		return formatJSON
	default:
		return formatText
	}
}

// validateOutput checks the format and columns before anything is fetched.
func validateOutput[T any](o outputOptions, jsonOutput bool, all []column[T], defaults []string) error {
	format := o.effectiveFormat(jsonOutput)
	if !slices.Contains([]string{formatText, formatJSON, formatCSV}, format) {
		return fmt.Errorf("%w: unknown --format %q, use text, json or csv", errs.Invalid, format)
	}
	if o.columns != "" && format != formatCSV {
		return fmt.Errorf("%w: --columns only works with --format csv", errs.Invalid)
	}
	if format == formatCSV {
		_, err := selectColumns(all, o.columns, defaults)
		return err
	}
	return nil
}

// column is a CSV column for rows of type T.
type column[T any] struct {
	name  string
	value func(T) string
}

// selectColumns looks up the columns in spec (comma-separated), or defaults if
// spec is empty.
func selectColumns[T any](all []column[T], spec string, defaults []string) ([]column[T], error) {
	names := defaults
	if spec != "" {
		names = strings.Split(spec, ",")
	}
	selected := make([]column[T], 0, len(names))
	for _, n := range names {
		n = strings.TrimSpace(n)
		i := slices.IndexFunc(all, func(c column[T]) bool { return c.name == n })
		if i < 0 {
			available := make([]string, len(all))
			for j, c := range all {
				available[j] = c.name
			}
			return nil, fmt.Errorf("%w: unknown column %q, use one of %s", errs.Invalid, n, strings.Join(available, ","))
		}
		selected = append(selected, all[i])
	}
	return selected, nil
}

// writeCSV writes rows with the selected columns. Rows with a missing value
// are skipped, since the tests need complete rows, and the number skipped is
// returned.
func writeCSV[T any](out io.Writer, rows []T, columns []column[T]) (int, error) {
	w := csv.NewWriter(out)
	header := make([]string, len(columns))
	for i, c := range columns {
		header[i] = c.name
	}
	if err := w.Write(header); err != nil {
		return 0, err
	}

	skipped := 0
	for _, r := range rows {
		row := make([]string, len(columns))
		complete := true
		for i, c := range columns {
			row[i] = c.value(r)
			complete = complete && row[i] != ""
		}
		if !complete {
			skipped++
			continue
		}
		if err := w.Write(row); err != nil {
			return skipped, err
		}
	}
	w.Flush()
	return skipped, w.Error()
}

// withOutFile runs write against stdout, or against a buffer that is written
// to path when write finishes without error, so a failed run does not leave a
// half-written file.
func withOutFile(path string, stdout, log io.Writer, write func(io.Writer) error) error {
	if path == "" {
		return write(stdout)
	}
	var buf bytes.Buffer
	if err := write(&buf); err != nil {
		return err
	}
	if err := os.WriteFile(path, buf.Bytes(), 0o644); err != nil {
		return fmt.Errorf("write %s: %w", path, err)
	}
	fmt.Fprintf(log, "Wrote the result to %s\n", path)
	return nil
}

// numberText turns a number into text, with 0 as an empty value.
func numberText[N ~uint32 | ~uint64](n N) string {
	if n == 0 {
		return ""
	}
	return fmt.Sprint(n)
}

// userID and partyID get IDs from a party, or empty text when the party or
// the value is missing.
func userID(p *register.Party) string {
	if p == nil || p.User == nil {
		return ""
	}
	return numberText(p.User.UserID)
}

func partyID(p *register.Party) string {
	if p == nil {
		return ""
	}
	return numberText(p.PartyID)
}

func writeJSON(out io.Writer, v any) error {
	enc := json.NewEncoder(out)
	enc.SetIndent("", "  ")
	return enc.Encode(v)
}
