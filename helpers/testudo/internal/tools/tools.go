// Package tools checks that the programs a command runs, such as k6 or
// kubectl, are on PATH. Commands check before they start, so a missing
// program is one error up front and not a failure halfway through.
package tools

import (
	"errors"
	"fmt"
	"os/exec"
)

// Require returns an error for each program in names that is not on PATH,
// or nil when all are. The errors wrap the one from exec.LookPath, so
// errors.Is(err, exec.ErrNotFound) holds when a program is missing.
func Require(names ...string) error {
	var missing []error
	for _, name := range names {
		if _, err := exec.LookPath(name); err != nil {
			missing = append(missing, fmt.Errorf("%s must be on PATH: %w", name, err))
		}
	}
	return errors.Join(missing...)
}
