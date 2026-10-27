package cmd

import (
	"errors"
	"net/http"
	"time"
)

var (
	ErrConnection      = errors.New("Connection error")
	ErrNotFound        = errors.New("Not found")
	ErrInvalidResponse = errors.New("Invalid server response")
	ErrInvalid         = errors.New("Invalid data")
)

var (
	tenorBaseUrl  = "https://testdata.api.skatteetaten.no"
	tenorSoekPath = "/api/testnorge/v2/soek"
	tenorScope    = "skatteetaten:testnorge/testdata.read"
)

var (
	maskinportenTokenEndpoint = "https://test.maskinporten.no/token"
)

// MASKINPORTEN_CLIENT_ID and MASKINPORTEN_JWK

type todo struct {
}

type response struct {
}

func newClient() *http.Client {
	c := &http.Client{
		Timeout: 10 * time.Second,
	}
	return c
}
