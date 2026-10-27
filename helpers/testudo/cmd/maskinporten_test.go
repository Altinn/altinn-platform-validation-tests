package cmd

import (
	"context"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"
)

var testNoekkel = sync.OnceValue(func() *rsa.PrivateKey {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}
	return key
})

func b64(i *big.Int) string {
	return base64.RawURLEncoding.EncodeToString(i.Bytes())
}

func testJWK(key *rsa.PrivateKey, kid string) string {
	felt := map[string]string{
		"kty": "RSA",
		"n":   b64(key.N), "e": b64(big.NewInt(int64(key.E))), "d": b64(key.D),
		"p": b64(key.Primes[0]), "q": b64(key.Primes[1]),
	}
	if kid != "" {
		felt["kid"] = kid
	}
	b, _ := json.Marshal(felt)
	return string(b)
}

// lesGrant verifiserer signaturen og returnerer header og payload.
func lesGrant(t *testing.T, grant string, pub *rsa.PublicKey) (map[string]any, map[string]any) {
	t.Helper()
	deler := strings.Split(grant, ".")
	if len(deler) != 3 {
		t.Fatalf("grant har %d deler", len(deler))
	}
	sig, _ := base64.RawURLEncoding.DecodeString(deler[2])
	hash := sha256.Sum256([]byte(deler[0] + "." + deler[1]))
	if err := rsa.VerifyPKCS1v15(pub, crypto.SHA256, hash[:], sig); err != nil {
		t.Fatalf("ugyldig signatur: %v", err)
	}
	var header, payload map[string]any
	h, _ := base64.RawURLEncoding.DecodeString(deler[0])
	p, _ := base64.RawURLEncoding.DecodeString(deler[1])
	json.Unmarshal(h, &header)
	json.Unmarshal(p, &payload)
	return header, payload
}

func TestMaskinportenTokenOgCache(t *testing.T) {
	key := testNoekkel()
	kall := 0
	var srvURL string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		kall++
		if r.Method != http.MethodPost || r.Header.Get("Content-Type") != "application/x-www-form-urlencoded" {
			t.Errorf("metode %s, content-type %q", r.Method, r.Header.Get("Content-Type"))
		}
		r.ParseForm()
		if r.Form.Get("grant_type") != "urn:ietf:params:oauth:grant-type:jwt-bearer" {
			t.Errorf("grant_type = %q", r.Form.Get("grant_type"))
		}
		header, payload := lesGrant(t, r.Form.Get("assertion"), &key.PublicKey)
		if header["alg"] != "RS256" || header["typ"] != "JWT" || header["kid"] != "min-kid" {
			t.Errorf("header = %v", header)
		}
		if payload["aud"] != srvURL || payload["iss"] != "klient" ||
			payload["scope"] != "a:les b:skriv" || payload["jti"] == "" {
			t.Errorf("payload = %v", payload)
		}
		if _, ok := payload["consumer_org"]; ok {
			t.Errorf("consumer_org skal ikke være satt: %v", payload)
		}
		if payload["exp"].(float64)-payload["iat"].(float64) != 60 {
			t.Errorf("levetid = %v", payload["exp"].(float64)-payload["iat"].(float64))
		}
		fmt.Fprintf(w, `{"access_token":"token-%d","expires_in":120,"scope":"a:les b:skriv"}`, kall)
	}))
	defer srv.Close()
	srvURL = srv.URL

	c, err := NewMaskinportenClient(MaskinportenConfig{
		ClientID: "klient", KID: "min-kid", JWK: key, TokenURL: srv.URL,
	}, "a:les", "b:skriv")
	if err != nil {
		t.Fatal(err)
	}
	naa := time.Date(2026, 10, 27, 12, 0, 0, 0, time.UTC)
	c.naa = func() time.Time { return naa }

	for range 2 {
		tok, err := c.Token(context.Background())
		if err != nil {
			t.Fatal(err)
		}
		if tok != "token-1" {
			t.Errorf("token = %q", tok)
		}
	}

	// 120s levetid, fornyes 30s før: fortsatt cachet etter 89s, nytt etter 90s.
	naa = naa.Add(89 * time.Second)
	if tok, _ := c.Token(context.Background()); tok != "token-1" {
		t.Errorf("etter 89s: token = %q", tok)
	}
	naa = naa.Add(time.Second)
	if tok, _ := c.Token(context.Background()); tok != "token-2" {
		t.Errorf("etter 90s: token = %q", tok)
	}
	if kall != 2 {
		t.Errorf("kall = %d", kall)
	}
}

func TestMaskinportenConsumerOrgOgUtenKid(t *testing.T) {
	key := testNoekkel()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.ParseForm()
		header, payload := lesGrant(t, r.Form.Get("assertion"), &key.PublicKey)
		if _, ok := header["kid"]; ok {
			t.Errorf("kid skal ikke være satt: %v", header)
		}
		if payload["consumer_org"] != "991825827" {
			t.Errorf("consumer_org = %v", payload["consumer_org"])
		}
		w.Write([]byte(`{"access_token":"t","expires_in":120}`))
	}))
	defer srv.Close()

	c, _ := NewMaskinportenClient(MaskinportenConfig{
		ClientID: "klient", JWK: key, ConsumerOrg: "991825827", TokenURL: srv.URL,
	}, "x")
	if _, err := c.Token(context.Background()); err != nil {
		t.Fatal(err)
	}
}

func TestMaskinportenFeilsvar(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error":"invalid_scope","error_description":"Scope finnes ikke"}`))
	}))
	defer srv.Close()

	c, _ := NewMaskinportenClient(MaskinportenConfig{
		ClientID: "klient", JWK: testNoekkel(), TokenURL: srv.URL,
	}, "x")
	_, err := c.Token(context.Background())
	if !errors.Is(err, ErrInvalidResponse) || !strings.Contains(err.Error(), "invalid_scope: Scope finnes ikke") {
		t.Errorf("err = %v", err)
	}
}

func TestNewMaskinportenClientValiderer(t *testing.T) {
	if _, err := NewMaskinportenClient(MaskinportenConfig{ClientID: "k"}, "x"); !errors.Is(err, ErrInvalid) {
		t.Errorf("uten JWK: %v", err)
	}
	if _, err := NewMaskinportenClient(MaskinportenConfig{ClientID: "k", JWK: testNoekkel()}); !errors.Is(err, ErrInvalid) {
		t.Errorf("uten scope: %v", err)
	}
}

func TestParsePrivatNoekkelJWK(t *testing.T) {
	key := testNoekkel()
	got, kid, err := ParsePrivatNoekkelJWK(testJWK(key, "kid-1"))
	if err != nil {
		t.Fatal(err)
	}
	if kid != "kid-1" || !got.Equal(key) {
		t.Errorf("kid = %q, lik = %v", kid, got.Equal(key))
	}

	for navn, s := range map[string]string{
		"ikke json": "{",
		"feil kty":  `{"kty":"EC"}`,
		"mangler d": strings.Replace(testJWK(key, "k"), `"d":`, `"x":`, 1),
	} {
		if _, _, err := ParsePrivatNoekkelJWK(s); !errors.Is(err, ErrInvalid) {
			t.Errorf("%s: err = %v", navn, err)
		}
	}
}

func TestMaskinportenConfigFra(t *testing.T) {
	key := testNoekkel()

	cfg, err := MaskinportenConfigFra(func(k string) string {
		return map[string]string{"MASKINPORTEN_CLIENT_ID": "c", "MASKINPORTEN_JWK": testJWK(key, "jwk-kid")}[k]
	})
	if err != nil {
		t.Fatal(err)
	}
	if cfg.ClientID != "c" || cfg.KID != "jwk-kid" || !cfg.JWK.Equal(key) {
		t.Errorf("cfg = %+v", cfg)
	}

	for navn, env := range map[string]map[string]string{
		"uten client id": {"MASKINPORTEN_JWK": testJWK(key, "k")},
		"uten jwk":       {"MASKINPORTEN_CLIENT_ID": "c"},
		"ugyldig jwk":    {"MASKINPORTEN_CLIENT_ID": "c", "MASKINPORTEN_JWK": "{"},
	} {
		if _, err := MaskinportenConfigFra(func(k string) string { return env[k] }); !errors.Is(err, ErrInvalid) {
			t.Errorf("%s: err = %v", navn, err)
		}
	}
}
