// Package errs has the errors the packages wrap, so callers can check them
// with errors.Is.
package errs

import "errors"

var (
	// Connection means a service could not be reached, or its response could
	// not be read.
	Connection = errors.New("Connection error")
	// NotFound means that what we asked for does not exist.
	NotFound = errors.New("Not found")
	// InvalidResponse is an error response or a response we do not understand.
	InvalidResponse = errors.New("Invalid server response")
	// Invalid is invalid input, e.g. flags or configuration.
	Invalid = errors.New("Invalid data")
)
