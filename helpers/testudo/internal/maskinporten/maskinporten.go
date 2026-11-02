// Package maskinporten henter access token med en JWT bearer grant, på
// samme måte som MaskinportenToken i altinn-access-management-frontend
// (playwright/api-requests/MaskinportenToken.ts og util/jwtHelper.ts).
package maskinporten

import (
	"context"
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
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
	// Levetiden til grant-en (exp - iat), som getCurrentTimestamps i frontend.
	maskinportenGrantLevetid = 60 * time.Second
	// Tokenet fornyes så lenge før det utløper.
	maskinportenFornyFoer = 30 * time.Second
)

// Config er det som trengs for å hente token fra Maskinporten.
type Config struct {
	// ClientID brukes som iss i grant-en.
	ClientID string
	// JWK er den private nøkkelen. Har den kid, settes den i JWT-headeren.
	JWK jwk.Key
	// ConsumerOrg settes som consumer_org for "på vegne av"-scenarioer.
	ConsumerOrg string
	// TokenURL er både token-endepunktet og aud. Standard er testmiljøet.
	TokenURL string
}

// ConfigFrom leser MASKINPORTEN_CLIENT_ID og MASKINPORTEN_JWK med
// hent, f.eks. os.Getenv eller viper.GetString.
func ConfigFrom(hent func(string) string) (Config, error) {
	cfg := Config{ClientID: hent("MASKINPORTEN_CLIENT_ID")}
	if cfg.ClientID == "" {
		return cfg, fmt.Errorf("%w: MASKINPORTEN_CLIENT_ID mangler", errs.Invalid)
	}
	tekst := hent("MASKINPORTEN_JWK")
	if tekst == "" {
		return cfg, fmt.Errorf("%w: MASKINPORTEN_JWK mangler", errs.Invalid)
	}
	key, err := ParsePrivateKeyJWK(tekst)
	if err != nil {
		return cfg, fmt.Errorf("MASKINPORTEN_JWK: %w", err)
	}
	cfg.JWK = key
	return cfg, nil
}

// ParsePrivateKeyJWK leser en privat RSA-nøkkel i JWK-format.
func ParsePrivateKeyJWK(s string) (jwk.Key, error) {
	key, err := jwk.ParseKey([]byte(s))
	if err != nil {
		return nil, fmt.Errorf("%w: JWK: %v", errs.Invalid, err)
	}
	if key.KeyType() != jwa.RSA() {
		return nil, fmt.Errorf("%w: JWK må ha kty RSA, har %q", errs.Invalid, key.KeyType())
	}
	if privat, err := jwk.IsPrivateKey(key); err != nil || !privat {
		return nil, fmt.Errorf("%w: JWK er ikke en privat nøkkel", errs.Invalid)
	}
	// key.Validate sjekker bare at feltene finnes. rsa.PrivateKey.Validate
	// sjekker også at de henger sammen, så en ødelagt nøkkel oppdages her og
	// ikke som en avvist signatur hos Maskinporten.
	raw, err := jwk.Export[*rsa.PrivateKey](key)
	if err != nil {
		return nil, fmt.Errorf("%w: JWK: %v", errs.Invalid, err)
	}
	if err := raw.Validate(); err != nil {
		return nil, fmt.Errorf("%w: JWK: %v", errs.Invalid, err)
	}
	return key, nil
}

// Client henter og cacher access token for et sett med scopes.
// Den kan brukes som TokenSource for tenor.Client.
type Client struct {
	cfg    Config
	scopes string
	http   *http.Client
	naa    func() time.Time

	mu       sync.Mutex
	token    string
	utloeper time.Time
}

// NewClient lager en klient som ber om de gitte scopene.
func NewClient(cfg Config, scopes ...string) (*Client, error) {
	if cfg.ClientID == "" || cfg.JWK == nil {
		return nil, fmt.Errorf("%w: Maskinporten trenger client ID og JWK", errs.Invalid)
	}
	if len(scopes) == 0 {
		return nil, fmt.Errorf("%w: minst ett scope må oppgis", errs.Invalid)
	}
	if cfg.TokenURL == "" {
		cfg.TokenURL = DefaultTokenURL
	}
	return &Client{
		cfg:    cfg,
		scopes: strings.Join(scopes, " "),
		http:   &http.Client{Timeout: 10 * time.Second},
		naa:    time.Now,
	}, nil
}

// Token returnerer et gyldig access token, og henter nytt når det er nær
// ved å utløpe.
func (c *Client) Token(ctx context.Context) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.token != "" && c.naa().Before(c.utloeper.Add(-maskinportenFornyFoer)) {
		return c.token, nil
	}

	token, levetid, err := c.hentToken(ctx)
	if err != nil {
		return "", err
	}
	c.token = token
	c.utloeper = c.naa().Add(levetid)
	return c.token, nil
}

func (c *Client) hentToken(ctx context.Context) (string, time.Duration, error) {
	grant, err := c.lagGrant()
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
		return "", 0, fmt.Errorf("%w: Maskinporten: les svar: %v", errs.Connection, err)
	}

	var svar struct {
		AccessToken      string `json:"access_token"`
		ExpiresIn        int64  `json:"expires_in"`
		Error            string `json:"error"`
		ErrorDescription string `json:"error_description"`
	}
	jsonErr := json.Unmarshal(body, &svar)

	if resp.StatusCode != http.StatusOK {
		detaljer := strings.TrimSpace(string(body))
		if jsonErr == nil && svar.Error != "" {
			detaljer = strings.TrimSpace(svar.Error + ": " + svar.ErrorDescription)
		}
		return "", 0, fmt.Errorf("%w: Maskinporten svarte HTTP %d: %s", errs.InvalidResponse, resp.StatusCode, detaljer)
	}
	if jsonErr != nil {
		return "", 0, fmt.Errorf("%w: Maskinporten: %v", errs.InvalidResponse, jsonErr)
	}
	if svar.AccessToken == "" || svar.ExpiresIn <= 0 {
		return "", 0, fmt.Errorf("%w: Maskinporten: svaret mangler access_token eller expires_in", errs.InvalidResponse)
	}
	return svar.AccessToken, time.Duration(svar.ExpiresIn) * time.Second, nil
}

// lagGrant signerer JWT-en som sendes som assertion. jwx setter alg, typ og
// kid (fra JWK-en) i headeren.
func (c *Client) lagGrant() (string, error) {
	jti, err := uuid.NewRandom()
	if err != nil {
		return "", fmt.Errorf("lag jti: %w", err)
	}
	naa := c.naa()

	b := jwt.NewBuilder().
		Audience([]string{c.cfg.TokenURL}).
		Issuer(c.cfg.ClientID).
		IssuedAt(naa).
		Expiration(naa.Add(maskinportenGrantLevetid)).
		JwtID(jti.String()).
		Claim("scope", c.scopes)
	if c.cfg.ConsumerOrg != "" {
		b = b.Claim("consumer_org", c.cfg.ConsumerOrg)
	}
	tok, err := b.Build()
	if err != nil {
		return "", fmt.Errorf("bygg Maskinporten-grant: %w", err)
	}
	// Maskinporten vil ha aud som tekst, ikke liste.
	tok.Options().Enable(jwt.FlattenAudience)

	signert, err := jwt.Sign(tok, jwt.WithKey(jwa.RS256(), c.cfg.JWK))
	if err != nil {
		return "", fmt.Errorf("signer Maskinporten-grant: %w", err)
	}
	return string(signert), nil
}
