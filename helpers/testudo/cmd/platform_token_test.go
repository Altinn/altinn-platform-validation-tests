package cmd

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestPlatformTokenOgCache(t *testing.T) {
	kall := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		kall++
		if r.Method != http.MethodGet || r.URL.Path != "/api/GetPlatformAccessToken" {
			t.Errorf("%s %s", r.Method, r.URL.Path)
		}
		if u, p, ok := r.BasicAuth(); !ok || u != "bruker" || p != "hemmelig" {
			t.Errorf("basic auth = %q %q %v", u, p, ok)
		}
		q := r.URL.Query()
		if q.Get("env") != "at23" || q.Get("app") != "testudo" || q.Get("ttl") != "60000" || q.Has("org") {
			t.Errorf("query = %v", q)
		}
		fmt.Fprintf(w, "token-%d\n", kall)
	}))
	defer srv.Close()

	g, err := NewPlatformTokenGenerator(PlatformTokenConfig{
		Brukernavn: "bruker", Passord: "hemmelig", Miljoe: "at23", BaseURL: srv.URL + "/",
	})
	if err != nil {
		t.Fatal(err)
	}
	naa := time.Date(2026, 10, 28, 12, 0, 0, 0, time.UTC)
	g.naa = func() time.Time { return naa }

	for range 2 {
		if tok, err := g.Token(context.Background()); err != nil || tok != "token-1" {
			t.Fatalf("token = %q, err = %v", tok, err)
		}
	}
	// 60000s levetid, fornyes 5 minutter før.
	naa = naa.Add(60000*time.Second - 5*time.Minute - time.Second)
	if tok, _ := g.Token(context.Background()); tok != "token-1" {
		t.Errorf("rett før fornyelse: token = %q", tok)
	}
	naa = naa.Add(time.Second)
	if tok, _ := g.Token(context.Background()); tok != "token-2" {
		t.Errorf("ved fornyelse: token = %q", tok)
	}
}

func TestPlatformTokenAppOrgOgTTL(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		if q.Get("app") != "min-app" || q.Get("org") != "ttd" || q.Get("ttl") != "120" {
			t.Errorf("query = %v", q)
		}
		w.Write([]byte("t"))
	}))
	defer srv.Close()

	g, _ := NewPlatformTokenGenerator(PlatformTokenConfig{
		Brukernavn: "b", Passord: "p", Miljoe: "tt02", App: "min-app", Org: "ttd",
		TTL: 2 * time.Minute, BaseURL: srv.URL,
	})
	if _, err := g.Token(context.Background()); err != nil {
		t.Fatal(err)
	}
}

func TestPlatformTokenFeil(t *testing.T) {
	for navn, h := range map[string]http.HandlerFunc{
		"401": func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Unauthorized"))
		},
		"tomt svar": func(w http.ResponseWriter, r *http.Request) {},
	} {
		srv := httptest.NewServer(h)
		g, _ := NewPlatformTokenGenerator(PlatformTokenConfig{Brukernavn: "b", Passord: "p", Miljoe: "at22", BaseURL: srv.URL})
		_, err := g.Token(context.Background())
		srv.Close()
		if !errors.Is(err, ErrInvalidResponse) {
			t.Errorf("%s: err = %v", navn, err)
		}
		if strings.Contains(fmt.Sprint(err), "p@") {
			t.Errorf("%s: passordet lekket i feilen: %v", navn, err)
		}
	}
}

func TestPlatformTokenConfigFra(t *testing.T) {
	tests := []struct {
		navn       string
		env        map[string]string
		miljoe     string
		brukernavn string
		ugyldig    bool
	}{
		{"K6-navn", map[string]string{"TOKEN_GENERATOR_USERNAME": "k6", "TOKEN_GENERATOR_PASSWORD": "p"}, "at22", "k6", false},
		{"frontend-navn", map[string]string{"USERNAME_TEST_API": "fe", "PASSWORD_TEST_API": "p"}, "at22", "fe", false},
		{"K6 går foran", map[string]string{"TOKEN_GENERATOR_USERNAME": "k6", "TOKEN_GENERATOR_PASSWORD": "p",
			"USERNAME_TEST_API": "fe", "PASSWORD_TEST_API": "q"}, "at22", "k6", false},
		{"mangler passord", map[string]string{"USERNAME_TEST_API": "fe"}, "at22", "", true},
		{"mangler miljø", map[string]string{"USERNAME_TEST_API": "fe", "PASSWORD_TEST_API": "p"}, "", "", true},
	}
	for _, tt := range tests {
		cfg, err := PlatformTokenConfigFra(func(k string) string { return tt.env[k] }, tt.miljoe)
		if tt.ugyldig {
			if !errors.Is(err, ErrInvalid) {
				t.Errorf("%s: err = %v", tt.navn, err)
			}
			continue
		}
		if err != nil || cfg.Brukernavn != tt.brukernavn || cfg.Miljoe != tt.miljoe {
			t.Errorf("%s: cfg = %+v, err = %v", tt.navn, cfg, err)
		}
	}
}
