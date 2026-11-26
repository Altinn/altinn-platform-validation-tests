// Package maskinporten fetches access tokens with a JWT bearer grant, the
// same way as MaskinportenToken in altinn-access-management-frontend
// (playwright/api-requests/MaskinportenToken.ts and util/jwtHelper.ts).
package maskinporten

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v4/jwa"
	"github.com/lestrrat-go/jwx/v4/jwk"
	"github.com/lestrrat-go/jwx/v4/jwt"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

const DefaultTokenURL = "https://test.maskinporten.no/token"

const (
	// Lifetime of the grant (exp - iat), like getCurrentTimestamps in the frontend.
	maskinportenGrantLifetime = 60 * time.Second
	// The token is renewed this long before it expires.
	maskinportenRenewBefore = 30 * time.Second
)

// Config is what is needed to fetch a token from Maskinporten.
type Config struct {
	// ClientID is used as iss in the grant.
	ClientID string
	// JWK is the private key. If it has a kid, it is set in the JWT header.
	JWK jwk.Key
	// ConsumerOrg is set as consumer_org for "on behalf of" scenarios.
	ConsumerOrg string
	// TokenURL is both the token endpoint and aud. Default is the test environment.
	TokenURL string
}

// ConfigFrom reads MASKINPORTEN_CLIENT_ID and the private key with lookup,
// e.g. os.Getenv or viper.GetString. The key is either MASKINPORTEN_JWK, or
// MASKINPORTEN_CLIENT_PEM with MASKINPORTEN_KID, as in K6.
func ConfigFrom(lookup func(string) string) (Config, error) {
	cfg := Config{ClientID: lookup("MASKINPORTEN_CLIENT_ID")}
	if cfg.ClientID == "" {
		return cfg, fmt.Errorf("%w: MASKINPORTEN_CLIENT_ID is missing", errs.Invalid)
	}
	jwkText, pemText, kid := lookup("MASKINPORTEN_JWK"), lookup("MASKINPORTEN_CLIENT_PEM"), lookup("MASKINPORTEN_KID")
	switch {
	case jwkText != "" && pemText != "":
		return cfg, fmt.Errorf("%w: set either MASKINPORTEN_JWK or MASKINPORTEN_CLIENT_PEM, not both", errs.Invalid)
	case jwkText != "":
		key, err := ParsePrivateKeyJWK(jwkText)
		if err != nil {
			return cfg, fmt.Errorf("MASKINPORTEN_JWK: %w", err)
		}
		cfg.JWK = key
	case pemText != "":
		if kid == "" {
			return cfg, fmt.Errorf("%w: MASKINPORTEN_KID is missing, it is needed with MASKINPORTEN_CLIENT_PEM", errs.Invalid)
		}
		key, err := ParsePrivateKeyPEM(pemText, kid)
		if err != nil {
			return cfg, fmt.Errorf("MASKINPORTEN_CLIENT_PEM: %w", err)
		}
		cfg.JWK = key
	default:
		return cfg, fmt.Errorf("%w: MASKINPORTEN_JWK or MASKINPORTEN_CLIENT_PEM is missing", errs.Invalid)
	}
	return cfg, nil
}

// ParsePrivateKeyPEM reads a private RSA key in PEM format, PKCS#8 or PKCS#1,
// and gives it kid. Literal \n is read as a line break, since secret stores
// and .env files sometimes flatten the newlines.
var pemRe = regexp.MustCompile(`(?s)-----BEGIN ([A-Z0-9 ]+)-----(.*?)-----END ([A-Z0-9 ]+)-----`)

// decodePEM reads the first PEM block in s. The line breaks in the body do
// not matter, so a PEM where they have become spaces (a multi-line quoted
// YAML string) or literal \n is read too.
func decodePEM(s string) (*pem.Block, error) {
	m := pemRe.FindStringSubmatch(s)
	if m == nil || m[1] != m[3] {
		return nil, fmt.Errorf("%w: not a PEM (-----BEGIN ...)", errs.Invalid)
	}
	body := strings.Join(strings.Fields(strings.ReplaceAll(m[2], `\n`, "\n")), "")
	der, err := base64.StdEncoding.DecodeString(body)
	if err != nil {
		return nil, fmt.Errorf("%w: PEM: %v", errs.Invalid, err)
	}
	return &pem.Block{Type: m[1], Bytes: der}, nil
}

func ParsePrivateKeyPEM(s, kid string) (jwk.Key, error) {
	block, err := decodePEM(s)
	if err != nil {
		return nil, err
	}
	var raw *rsa.PrivateKey
	switch block.Type {
	case "PRIVATE KEY":
		parsed, err := x509.ParsePKCS8PrivateKey(block.Bytes)
		if err != nil {
			return nil, fmt.Errorf("%w: PEM: %v", errs.Invalid, err)
		}
		var ok bool
		if raw, ok = parsed.(*rsa.PrivateKey); !ok {
			return nil, fmt.Errorf("%w: PEM must be an RSA key, is %T", errs.Invalid, parsed)
		}
	case "RSA PRIVATE KEY":
		var err error
		if raw, err = x509.ParsePKCS1PrivateKey(block.Bytes); err != nil {
			return nil, fmt.Errorf("%w: PEM: %v", errs.Invalid, err)
		}
	default:
		return nil, fmt.Errorf("%w: PEM must be a private key, is %q", errs.Invalid, block.Type)
	}
	if err := raw.Validate(); err != nil {
		return nil, fmt.Errorf("%w: PEM: %v", errs.Invalid, err)
	}
	key, err := jwk.Import[jwk.Key](raw)
	if err != nil {
		return nil, fmt.Errorf("%w: PEM: %v", errs.Invalid, err)
	}
	if err := key.Set(jwk.KeyIDKey, kid); err != nil {
		return nil, fmt.Errorf("%w: kid: %v", errs.Invalid, err)
	}
	return key, nil
}

// ParsePrivateKeyJWK reads a private RSA key in JWK format.
func ParsePrivateKeyJWK(s string) (jwk.Key, error) {
	key, err := jwk.ParseKey([]byte(s))
	if err != nil {
		return nil, fmt.Errorf("%w: JWK: %v", errs.Invalid, err)
	}
	if key.KeyType() != jwa.RSA() {
		return nil, fmt.Errorf("%w: JWK must have kty RSA, has %q", errs.Invalid, key.KeyType())
	}
	if isPrivate, err := jwk.IsPrivateKey(key); err != nil || !isPrivate {
		return nil, fmt.Errorf("%w: JWK is not a private key", errs.Invalid)
	}
	// key.Validate only checks that the fields exist. rsa.PrivateKey.Validate
	// also checks that they are consistent, so a broken key is caught here and
	// not as a rejected signature at Maskinporten.
	raw, err := jwk.Export[*rsa.PrivateKey](key)
	if err != nil {
		return nil, fmt.Errorf("%w: JWK: %v", errs.Invalid, err)
	}
	if err := raw.Validate(); err != nil {
		return nil, fmt.Errorf("%w: JWK: %v", errs.Invalid, err)
	}
	return key, nil
}

// Client fetches and caches access tokens for a set of scopes.
// It can be used as TokenSource for tenor.Client.
type Client struct {
	cfg    Config
	scopes string
	http   *http.Client
	now    func() time.Time

	mu      sync.Mutex
	token   string
	expires time.Time
}

// NewClient creates a client that asks for the given scopes.
func NewClient(cfg Config, scopes ...string) (*Client, error) {
	if cfg.ClientID == "" || cfg.JWK == nil {
		return nil, fmt.Errorf("%w: Maskinporten needs a client ID and a JWK", errs.Invalid)
	}
	if len(scopes) == 0 {
		return nil, fmt.Errorf("%w: at least one scope must be given", errs.Invalid)
	}
	if cfg.TokenURL == "" {
		cfg.TokenURL = DefaultTokenURL
	}
	return &Client{
		cfg:    cfg,
		scopes: strings.Join(scopes, " "),
		http:   &http.Client{Timeout: 10 * time.Second},
		now:    time.Now,
	}, nil
}

// Token returns a valid access token, and fetches a new one when it is close
// to expiring.
func (c *Client) Token(ctx context.Context) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.token != "" && c.now().Before(c.expires.Add(-maskinportenRenewBefore)) {
		return c.token, nil
	}

	token, lifetime, err := c.fetchToken(ctx)
	if err != nil {
		return "", err
	}
	c.token = token
	c.expires = c.now().Add(lifetime)
	return c.token, nil
}

func (c *Client) fetchToken(ctx context.Context) (string, time.Duration, error) {
	grant, err := c.makeGrant()
	if err != nil {
		return "", 0, err
	}

	form := url.Values{
		"grant_type": {"urn:ietf:params:oauth:grant-type:jwt-bearer"},
		"assertion":  {grant},
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.cfg.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return "", 0, fmt.Errorf("%w: %v", errs.Invalid, err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return "", 0, fmt.Errorf("%w: Maskinporten: %v", errs.Connection, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", 0, fmt.Errorf("%w: Maskinporten: read response: %v", errs.Connection, err)
	}

	var tokenResp struct {
		AccessToken      string `json:"access_token"`
		ExpiresIn        int64  `json:"expires_in"`
		Error            string `json:"error"`
		ErrorDescription string `json:"error_description"`
	}
	jsonErr := json.Unmarshal(body, &tokenResp)

	if resp.StatusCode != http.StatusOK {
		details := strings.TrimSpace(string(body))
		if jsonErr == nil && tokenResp.Error != "" {
			details = strings.TrimSpace(tokenResp.Error + ": " + tokenResp.ErrorDescription)
		}
		return "", 0, fmt.Errorf("%w: Maskinporten responded with HTTP %d: %s", errs.InvalidResponse, resp.StatusCode, details)
	}
	if jsonErr != nil {
		return "", 0, fmt.Errorf("%w: Maskinporten: %v", errs.InvalidResponse, jsonErr)
	}
	if tokenResp.AccessToken == "" || tokenResp.ExpiresIn <= 0 {
		return "", 0, fmt.Errorf("%w: Maskinporten: the response is missing access_token or expires_in", errs.InvalidResponse)
	}
	return tokenResp.AccessToken, time.Duration(tokenResp.ExpiresIn) * time.Second, nil
}

// makeGrant signs the JWT that is sent as assertion. jwx sets alg, typ and
// kid (from the JWK) in the header.
func (c *Client) makeGrant() (string, error) {
	jti, err := uuid.NewRandom()
	if err != nil {
		return "", fmt.Errorf("generate jti: %w", err)
	}
	now := c.now()

	b := jwt.NewBuilder().
		Audience([]string{c.cfg.TokenURL}).
		Issuer(c.cfg.ClientID).
		IssuedAt(now).
		Expiration(now.Add(maskinportenGrantLifetime)).
		JwtID(jti.String()).
		Claim("scope", c.scopes)
	if c.cfg.ConsumerOrg != "" {
		b = b.Claim("consumer_org", c.cfg.ConsumerOrg)
	}
	tok, err := b.Build()
	if err != nil {
		return "", fmt.Errorf("build Maskinporten grant: %w", err)
	}
	// Maskinporten wants aud as a string, not a list.
	tok.Options().Enable(jwt.FlattenAudience)

	signed, err := jwt.Sign(tok, jwt.WithKey(jwa.RS256(), c.cfg.JWK))
	if err != nil {
		return "", fmt.Errorf("sign Maskinporten grant: %w", err)
	}
	return string(signed), nil
}
