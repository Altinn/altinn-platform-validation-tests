package platformtoken

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

func TestPlatformTokenAndCache(t *testing.T) {
	calls := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		if r.Method != http.MethodGet || r.URL.Path != "/api/GetPlatformAccessToken" {
			t.Errorf("%s %s", r.Method, r.URL.Path)
		}
		if u, p, ok := r.BasicAuth(); !ok || u != "user" || p != "secret" {
			t.Errorf("basic auth = %q %q %v", u, p, ok)
		}
		q := r.URL.Query()
		if q.Get("env") != "at23" || q.Get("app") != "testudo" || q.Get("ttl") != "300" || q.Has("org") {
			t.Errorf("query = %v", q)
		}
		fmt.Fprintf(w, "token-%d\n", calls)
	}))
	defer srv.Close()

	g, err := NewGenerator(Config{
		Username: "user", Password: "secret", Environment: "at23", BaseURL: srv.URL + "/",
	})
	if err != nil {
		t.Fatal(err)
	}
	now := time.Date(2026, 10, 28, 12, 0, 0, 0, time.UTC)
	g.now = func() time.Time { return now }

	for range 2 {
		if tok, err := g.Token(context.Background()); err != nil || tok != "token-1" {
			t.Fatalf("token = %q, err = %v", tok, err)
		}
	}
	// 5 minute lifetime, renewed 30 seconds before.
	now = now.Add(5*time.Minute - 30*time.Second - time.Second)
	if tok, _ := g.Token(context.Background()); tok != "token-1" {
		t.Errorf("just before renewal: token = %q", tok)
	}
	now = now.Add(time.Second)
	if tok, _ := g.Token(context.Background()); tok != "token-2" {
		t.Errorf("at renewal: token = %q", tok)
	}
}

func TestPlatformTokenAppOrgAndTTL(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		if q.Get("app") != "my-app" || q.Get("org") != "ttd" || q.Get("ttl") != "120" {
			t.Errorf("query = %v", q)
		}
		w.Write([]byte("t"))
	}))
	defer srv.Close()

	g, _ := NewGenerator(Config{
		Username: "b", Password: "p", Environment: "tt02", App: "my-app", Org: "ttd",
		TTL: 2 * time.Minute, BaseURL: srv.URL,
	})
	if _, err := g.Token(context.Background()); err != nil {
		t.Fatal(err)
	}
}

func TestPlatformTokenErrors(t *testing.T) {
	for name, h := range map[string]http.HandlerFunc{
		"401": func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Unauthorized"))
		},
		"empty response": func(w http.ResponseWriter, r *http.Request) {},
	} {
		srv := httptest.NewServer(h)
		g, _ := NewGenerator(Config{Username: "b", Password: "p", Environment: "at22", BaseURL: srv.URL})
		_, err := g.Token(context.Background())
		srv.Close()
		if !errors.Is(err, errs.InvalidResponse) {
			t.Errorf("%s: err = %v", name, err)
		}
		if strings.Contains(fmt.Sprint(err), "p@") {
			t.Errorf("%s: the password leaked into the error: %v", name, err)
		}
	}
}

func TestPlatformTokenConfigFrom(t *testing.T) {
	tests := []struct {
		name        string
		env         map[string]string
		environment string
		username    string
		invalid     bool
	}{
		{"ok", map[string]string{"TOKEN_GENERATOR_USERNAME": "k6", "TOKEN_GENERATOR_PASSWORD": "p"}, "at22", "k6", false},
		{"frontend names", map[string]string{"USERNAME_TEST_API": "fe", "PASSWORD_TEST_API": "p"}, "at22", "", true},
		{"missing password", map[string]string{"TOKEN_GENERATOR_USERNAME": "k6"}, "at22", "", true},
		{"missing environment", map[string]string{"TOKEN_GENERATOR_USERNAME": "k6", "TOKEN_GENERATOR_PASSWORD": "p"}, "", "", true},
	}
	for _, tt := range tests {
		cfg, err := ConfigFrom(func(k string) string { return tt.env[k] }, tt.environment)
		if tt.invalid {
			if !errors.Is(err, errs.Invalid) {
				t.Errorf("%s: err = %v", tt.name, err)
			}
			continue
		}
		if err != nil || cfg.Username != tt.username || cfg.Environment != tt.environment {
			t.Errorf("%s: cfg = %+v, err = %v", tt.name, cfg, err)
		}
	}
}
