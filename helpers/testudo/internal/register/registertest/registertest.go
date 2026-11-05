// Package registertest has a fake Register for tests.
package registertest

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
)

const (
	// SubscriptionKey and PlatformToken are what the client from NewClient
	// sends.
	SubscriptionKey = "key"
	PlatformToken   = "platform"
)

type token string

func (t token) Token(context.Context) (string, error) {
	return string(t), nil
}

// NewClient gives a client for a test server with h.
func NewClient(t *testing.T, h http.HandlerFunc) *register.Client {
	t.Helper()
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	return register.NewClient(srv.URL+"/", SubscriptionKey, token(PlatformToken))
}

// ReadQuery checks the headers in a call to POST /parties/query and returns
// the URNs in it.
func ReadQuery(t *testing.T, r *http.Request) []string {
	t.Helper()
	if r.Method != http.MethodPost || r.URL.Path != "/register/api/v1/access-management/parties/query" {
		t.Errorf("%s %s", r.Method, r.URL.Path)
	}
	if r.Header.Get("PlatformAccessToken") != PlatformToken || r.Header.Get("Ocp-Apim-Subscription-Key") != SubscriptionKey ||
		r.Header.Get("Content-Type") != "application/json" || r.Header.Get("Authorization") != "" {
		t.Errorf("headers = %v", r.Header)
	}
	var body struct {
		Data []string `json:"data"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	return body.Data
}

// Empty is a Register where no parties exist.
func Empty(t *testing.T) *register.Client {
	t.Helper()
	return NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"data":[]}`))
	})
}

// Echo is a Register where all parties exist, for tests that are not about
// Register. Persons get partyUuid p-<fnr>, a user and the name PERSON <fnr>.
// Organizations get partyUuid o-<orgnr>, the name VIRKSOMHET <orgnr> and
// unitType AS.
func Echo(t *testing.T) *register.Client {
	t.Helper()
	return NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		var data []string
		for i, u := range ReadQuery(t, r) {
			id := u[strings.LastIndex(u, ":")+1:]
			if strings.Contains(u, ":person:") {
				data = append(data, fmt.Sprintf(`{"partyUuid":"p-%s","partyId":%d,"partyType":"person","personIdentifier":"%s",`+
					`"displayName":"PERSON %s","firstName":"PERSON","lastName":"%s","user":{"userId":%d}}`, id, 1000+i, id, id, id, 2000+i))
			} else {
				data = append(data, fmt.Sprintf(`{"partyUuid":"o-%s","partyId":%d,"partyType":"organization","organizationIdentifier":"%s",`+
					`"displayName":"VIRKSOMHET %s","unitType":"AS"}`, id, 1000+i, id, id))
			}
		}
		w.Write([]byte(`{"data":[` + strings.Join(data, ",") + `]}`))
	})
}
