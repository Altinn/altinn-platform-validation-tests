// Package registertest har en falsk Register for tester.
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
	// SubscriptionKey og PlatformToken er det klienten fra NewClient sender.
	SubscriptionKey = "nøkkel"
	PlatformToken   = "plattform"
)

type token string

func (t token) Token(context.Context) (string, error) {
	return string(t), nil
}

// NewClient gir en klient mot en testserver med h.
func NewClient(t *testing.T, h http.HandlerFunc) *register.Client {
	t.Helper()
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	return register.NewClient(srv.URL+"/", SubscriptionKey, token(PlatformToken))
}

// ReadQuery sjekker headerne i et kall til POST /parties/query og returnerer
// URN-ene i det.
func ReadQuery(t *testing.T, r *http.Request) []string {
	t.Helper()
	if r.Method != http.MethodPost || r.URL.Path != "/register/api/v1/access-management/parties/query" {
		t.Errorf("%s %s", r.Method, r.URL.Path)
	}
	if r.Header.Get("PlatformAccessToken") != PlatformToken || r.Header.Get("Ocp-Apim-Subscription-Key") != SubscriptionKey ||
		r.Header.Get("Content-Type") != "application/json" || r.Header.Get("Authorization") != "" {
		t.Errorf("headere = %v", r.Header)
	}
	var body struct {
		Data []string `json:"data"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	return body.Data
}

// Empty er et Register der ingen parter finnes.
func Empty(t *testing.T) *register.Client {
	t.Helper()
	return NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"data":[]}`))
	})
}

// Echo er et Register der alle parter finnes, for tester som ikke handler om
// Register. Personer får partyUuid p-<fnr>, bruker og navnet PERSON <fnr>.
// Virksomheter får partyUuid o-<orgnr>, navnet VIRKSOMHET <orgnr> og
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
