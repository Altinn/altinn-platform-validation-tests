// Package errs har feilene pakkene pakker inn, så kallere kan sjekke dem med
// errors.Is.
package errs

import "errors"

var (
	// Connection er at en tjeneste ikke kunne nås, eller at svaret ikke kunne
	// leses.
	Connection = errors.New("Connection error")
	// NotFound er at det vi spurte etter ikke finnes.
	NotFound = errors.New("Not found")
	// InvalidResponse er et feilsvar eller et svar vi ikke forstår.
	InvalidResponse = errors.New("Invalid server response")
	// Invalid er ugyldig input, f.eks. flagg eller konfigurasjon.
	Invalid = errors.New("Invalid data")
)
