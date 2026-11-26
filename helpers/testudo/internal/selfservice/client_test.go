package selfservice_test

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/selfservice"
)

type staticToken string

func (s staticToken) Token(context.Context) (string, error) { return string(s), nil }

func newClient(t *testing.T, handler http.HandlerFunc) *selfservice.Client {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	return selfservice.NewClient(srv.URL+"/", staticToken("tok"))
}

func TestGetClient(t *testing.T) {
	c := newClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet || r.URL.Path != "/api/v1/clients/abc-123" {
			t.Errorf("request = %s %s", r.Method, r.URL.Path)
		}
		if r.Header.Get("Authorization") != "Bearer tok" {
			t.Errorf("Authorization = %q", r.Header.Get("Authorization"))
		}
		w.Write([]byte(`{"client_id":"abc-123","client_name":"K6 klient","client_orgno":"313175650",
			"active":true,"integration_type":"maskinporten","scopes":["altinn:instances.read"]}`))
	})

	got, err := c.GetClient(context.Background(), "abc-123")
	if err != nil {
		t.Fatal(err)
	}
	if got.ClientID != "abc-123" || got.ClientName != "K6 klient" || got.ClientOrgno != "313175650" ||
		!got.Active || len(got.Scopes) != 1 {
		t.Errorf("client = %+v", got)
	}
}

func TestGetJWKS(t *testing.T) {
	c := newClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/v1/clients/abc-123/jwks" {
			t.Errorf("path = %s", r.URL.Path)
		}
		w.Write([]byte(`{"keys":[
			{"kid":"new","kty":"RSA","alg":"RS256","exp":1798761600,"created":"2026-01-01T00:00:00Z"},
			{"kid":"no-exp","kty":"RSA"}
		]}`))
	})

	keys, err := c.GetJWKS(context.Background(), "abc-123")
	if err != nil {
		t.Fatal(err)
	}
	if len(keys) != 2 || keys[0].Kid != "new" || keys[1].Kid != "no-exp" {
		t.Fatalf("keys = %+v", keys)
	}
	if want := time.Date(2027, 1, 1, 0, 0, 0, 0, time.UTC); !keys[0].Expires().Equal(want) {
		t.Errorf("expires = %v, want %v", keys[0].Expires(), want)
	}
	if !keys[1].Expires().IsZero() {
		t.Errorf("a key without exp should give zero time, got %v", keys[1].Expires())
	}
}

func TestErrors(t *testing.T) {
	for _, tc := range []struct {
		status int
		want   error
	}{
		{http.StatusNotFound, errs.NotFound},
		{http.StatusForbidden, errs.InvalidResponse},
	} {
		c := newClient(t, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(tc.status)
		})
		if _, err := c.GetJWKS(context.Background(), "x"); !errors.Is(err, tc.want) {
			t.Errorf("HTTP %d: err = %v, want %v", tc.status, err, tc.want)
		}
	}
}
