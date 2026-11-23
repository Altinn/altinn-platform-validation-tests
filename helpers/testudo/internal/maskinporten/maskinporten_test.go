package maskinporten

import (
	"context"
	"crypto"
	"crypto/ecdsa"
	"crypto/elliptic"
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

	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v4/jwk"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

var testKey = sync.OnceValue(func() *rsa.PrivateKey {
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
	fields := map[string]string{
		"kty": "RSA",
		"n":   b64(key.N), "e": b64(big.NewInt(int64(key.E))), "d": b64(key.D),
		"p": b64(key.Primes[0]), "q": b64(key.Primes[1]),
	}
	if kid != "" {
		fields["kid"] = kid
	}
	b, _ := json.Marshal(fields)
	return string(b)
}

// testJWKKey is the test key as a jwk.Key, with kid if it is not empty.
func testJWKKey(t *testing.T, kid string) jwk.Key {
	t.Helper()
	key, err := ParsePrivateKeyJWK(testJWK(testKey(), kid))
	if err != nil {
		t.Fatal(err)
	}
	return key
}

// exportRSA returns the RSA key inside a jwk.Key.
func exportRSA(t *testing.T, key jwk.Key) *rsa.PrivateKey {
	t.Helper()
	raw, err := jwk.Export[*rsa.PrivateKey](key)
	if err != nil {
		t.Fatal(err)
	}
	return raw
}

// readGrant verifies the signature and returns header and payload.
func readGrant(t *testing.T, grant string, pub *rsa.PublicKey) (map[string]any, map[string]any) {
	t.Helper()
	parts := strings.Split(grant, ".")
	if len(parts) != 3 {
		t.Fatalf("grant has %d parts", len(parts))
	}
	sig, _ := base64.RawURLEncoding.DecodeString(parts[2])
	hash := sha256.Sum256([]byte(parts[0] + "." + parts[1]))
	if err := rsa.VerifyPKCS1v15(pub, crypto.SHA256, hash[:], sig); err != nil {
		t.Fatalf("invalid signature: %v", err)
	}
	var header, payload map[string]any
	h, _ := base64.RawURLEncoding.DecodeString(parts[0])
	p, _ := base64.RawURLEncoding.DecodeString(parts[1])
	json.Unmarshal(h, &header)
	json.Unmarshal(p, &payload)
	return header, payload
}

func TestMaskinportenTokenAndCache(t *testing.T) {
	key := testKey()
	calls := 0
	var srvURL string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		if r.Method != http.MethodPost || r.Header.Get("Content-Type") != "application/x-www-form-urlencoded" {
			t.Errorf("method %s, content-type %q", r.Method, r.Header.Get("Content-Type"))
		}
		r.ParseForm()
		if r.Form.Get("grant_type") != "urn:ietf:params:oauth:grant-type:jwt-bearer" {
			t.Errorf("grant_type = %q", r.Form.Get("grant_type"))
		}
		header, payload := readGrant(t, r.Form.Get("assertion"), &key.PublicKey)
		if header["alg"] != "RS256" || header["typ"] != "JWT" || header["kid"] != "my-kid" {
			t.Errorf("header = %v", header)
		}
		if payload["aud"] != srvURL || payload["iss"] != "client" || payload["scope"] != "a:read b:write" {
			t.Errorf("payload = %v", payload)
		}
		if jti, err := uuid.Parse(fmt.Sprint(payload["jti"])); err != nil || jti.Version() != 4 {
			t.Errorf("jti = %v, want UUID v4 (err = %v)", payload["jti"], err)
		}
		if _, ok := payload["consumer_org"]; ok {
			t.Errorf("consumer_org should not be set: %v", payload)
		}
		if payload["exp"].(float64)-payload["iat"].(float64) != 60 {
			t.Errorf("lifetime = %v", payload["exp"].(float64)-payload["iat"].(float64))
		}
		fmt.Fprintf(w, `{"access_token":"token-%d","expires_in":120,"scope":"a:read b:write"}`, calls)
	}))
	defer srv.Close()
	srvURL = srv.URL

	c, err := NewClient(Config{
		ClientID: "client", JWK: testJWKKey(t, "my-kid"), TokenURL: srv.URL,
	}, "a:read", "b:write")
	if err != nil {
		t.Fatal(err)
	}
	now := time.Date(2026, 10, 27, 12, 0, 0, 0, time.UTC)
	c.now = func() time.Time { return now }

	for range 2 {
		tok, err := c.Token(context.Background())
		if err != nil {
			t.Fatal(err)
		}
		if tok != "token-1" {
			t.Errorf("token = %q", tok)
		}
	}

	// 120s lifetime, renewed 30s before: still cached after 89s, new after 90s.
	now = now.Add(89 * time.Second)
	if tok, _ := c.Token(context.Background()); tok != "token-1" {
		t.Errorf("after 89s: token = %q", tok)
	}
	now = now.Add(time.Second)
	if tok, _ := c.Token(context.Background()); tok != "token-2" {
		t.Errorf("after 90s: token = %q", tok)
	}
	if calls != 2 {
		t.Errorf("calls = %d", calls)
	}
}

func TestMaskinportenConsumerOrgAndNoKid(t *testing.T) {
	key := testKey()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.ParseForm()
		header, payload := readGrant(t, r.Form.Get("assertion"), &key.PublicKey)
		if _, ok := header["kid"]; ok {
			t.Errorf("kid should not be set: %v", header)
		}
		if payload["consumer_org"] != "991825827" {
			t.Errorf("consumer_org = %v", payload["consumer_org"])
		}
		w.Write([]byte(`{"access_token":"t","expires_in":120}`))
	}))
	defer srv.Close()

	c, _ := NewClient(Config{
		ClientID: "client", JWK: testJWKKey(t, ""), ConsumerOrg: "991825827", TokenURL: srv.URL,
	}, "x")
	if _, err := c.Token(context.Background()); err != nil {
		t.Fatal(err)
	}
}

func TestMaskinportenErrorResponse(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error":"invalid_scope","error_description":"Scope does not exist"}`))
	}))
	defer srv.Close()

	c, _ := NewClient(Config{
		ClientID: "client", JWK: testJWKKey(t, ""), TokenURL: srv.URL,
	}, "x")
	_, err := c.Token(context.Background())
	if !errors.Is(err, errs.InvalidResponse) || !strings.Contains(err.Error(), "invalid_scope: Scope does not exist") {
		t.Errorf("err = %v", err)
	}
}

func TestNewMaskinportenClientValidates(t *testing.T) {
	if _, err := NewClient(Config{ClientID: "k"}, "x"); !errors.Is(err, errs.Invalid) {
		t.Errorf("without JWK: %v", err)
	}
	if _, err := NewClient(Config{ClientID: "k", JWK: testJWKKey(t, "")}); !errors.Is(err, errs.Invalid) {
		t.Errorf("without scope: %v", err)
	}
}

func TestParsePrivateKeyJWK(t *testing.T) {
	key := testKey()
	got, err := ParsePrivateKeyJWK(testJWK(key, "kid-1"))
	if err != nil {
		t.Fatal(err)
	}
	if kid, _ := got.KeyID(); kid != "kid-1" || !exportRSA(t, got).Equal(key) {
		t.Errorf("kid = %q, equal = %v", kid, exportRSA(t, got).Equal(key))
	}

	ec, _ := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	ecJWK, _ := jwk.Import[jwk.Key](ec)
	ecJSON, _ := json.Marshal(ecJWK)
	public, _ := jwk.Import[jwk.Key](&key.PublicKey)
	publicJSON, _ := json.Marshal(public)

	for name, s := range map[string]string{
		"not json":   "{",
		"EC key":     string(ecJSON),
		"public key": string(publicJSON),
		"wrong d":    strings.Replace(testJWK(key, "k"), `"d":"`+b64(key.D)+`"`, `"d":"`+b64(big.NewInt(12345))+`"`, 1),
	} {
		if _, err := ParsePrivateKeyJWK(s); !errors.Is(err, errs.Invalid) {
			t.Errorf("%s: err = %v", name, err)
		}
	}
}

func TestMaskinportenConfigFrom(t *testing.T) {
	key := testKey()

	cfg, err := ConfigFrom(func(k string) string {
		return map[string]string{"MASKINPORTEN_CLIENT_ID": "c", "MASKINPORTEN_JWK": testJWK(key, "jwk-kid")}[k]
	})
	if err != nil {
		t.Fatal(err)
	}
	if kid, _ := cfg.JWK.KeyID(); cfg.ClientID != "c" || kid != "jwk-kid" || !exportRSA(t, cfg.JWK).Equal(key) {
		t.Errorf("cfg = %+v", cfg)
	}

	for name, env := range map[string]map[string]string{
		"without client id": {"MASKINPORTEN_JWK": testJWK(key, "k")},
		"without jwk":       {"MASKINPORTEN_CLIENT_ID": "c"},
		"invalid jwk":       {"MASKINPORTEN_CLIENT_ID": "c", "MASKINPORTEN_JWK": "{"},
	} {
		if _, err := ConfigFrom(func(k string) string { return env[k] }); !errors.Is(err, errs.Invalid) {
			t.Errorf("%s: err = %v", name, err)
		}
	}
}
