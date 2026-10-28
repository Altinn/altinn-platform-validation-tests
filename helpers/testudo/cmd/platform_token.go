package cmd

// Henter platform access token fra Altinn sin test token generator, som
// PlatformTokenGenerator i K6/token-generator.js.

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
)

var tokenGeneratorBaseURL = "https://altinn-testtools-token-generator.azurewebsites.net"

const (
	platformTokenPath = "/api/GetPlatformAccessToken"
	// standardPlatformApp er app-navnet tokenet utstedes for. K6 bruker
	// k6-e2e-tests og frontend testtjeneste.
	standardPlatformApp = "testudo"
	// standardPlatformTTL er levetiden vi ber om, som i K6 og frontend.
	standardPlatformTTL = 60000 * time.Second
	// platformFornyFoer er hvor lenge før utløp tokenet hentes på nytt.
	platformFornyFoer = 5 * time.Minute
)

// PlatformTokenConfig er det som trengs for å hente platform access token.
type PlatformTokenConfig struct {
	// Brukernavn og Passord er Basic auth mot token generatoren.
	Brukernavn string
	Passord    string
	// Miljoe er env-parameteren, f.eks. at22, at23 eller tt02.
	Miljoe string
	// App er appen tokenet utstedes for. Standard er testudo.
	App string
	// Org setter utstederen. Tom betyr token generatorens standard.
	Org string
	// TTL er levetiden vi ber om. Standard er 60000 sekunder.
	TTL time.Duration
	// BaseURL er token generatoren. Standard er Altinn sin.
	BaseURL string
}

// PlatformTokenConfigFra leser brukernavn og passord med hent. Navnene fra K6
// (TOKEN_GENERATOR_USERNAME og TOKEN_GENERATOR_PASSWORD) går foran navnene fra
// altinn-access-management-frontend (USERNAME_TEST_API og PASSWORD_TEST_API).
func PlatformTokenConfigFra(hent func(string) string, miljoe string) (PlatformTokenConfig, error) {
	cfg := PlatformTokenConfig{
		Brukernavn: forste(hent("TOKEN_GENERATOR_USERNAME"), hent("USERNAME_TEST_API")),
		Passord:    forste(hent("TOKEN_GENERATOR_PASSWORD"), hent("PASSWORD_TEST_API")),
		Miljoe:     miljoe,
	}
	if cfg.Brukernavn == "" || cfg.Passord == "" {
		return cfg, fmt.Errorf("%w: TOKEN_GENERATOR_USERNAME og TOKEN_GENERATOR_PASSWORD (eller USERNAME_TEST_API og PASSWORD_TEST_API) må være satt", ErrInvalid)
	}
	if miljoe == "" {
		return cfg, fmt.Errorf("%w: miljø mangler", ErrInvalid)
	}
	return cfg, nil
}

// PlatformTokenGenerator henter og cacher platform access token. Den
// implementerer TokenSource.
type PlatformTokenGenerator struct {
	cfg  PlatformTokenConfig
	http *http.Client
	naa  func() time.Time

	mu       sync.Mutex
	token    string
	utloeper time.Time
}

func NewPlatformTokenGenerator(cfg PlatformTokenConfig) (*PlatformTokenGenerator, error) {
	if cfg.Brukernavn == "" || cfg.Passord == "" || cfg.Miljoe == "" {
		return nil, fmt.Errorf("%w: token generatoren trenger brukernavn, passord og miljø", ErrInvalid)
	}
	if cfg.App == "" {
		cfg.App = standardPlatformApp
	}
	if cfg.TTL <= 0 {
		cfg.TTL = standardPlatformTTL
	}
	if cfg.BaseURL == "" {
		cfg.BaseURL = tokenGeneratorBaseURL
	}
	cfg.BaseURL = strings.TrimRight(cfg.BaseURL, "/")
	return &PlatformTokenGenerator{cfg: cfg, http: newClient(), naa: time.Now}, nil
}

// Token returnerer et gyldig platform access token.
func (g *PlatformTokenGenerator) Token(ctx context.Context) (string, error) {
	g.mu.Lock()
	defer g.mu.Unlock()

	if g.token != "" && g.naa().Before(g.utloeper.Add(-platformFornyFoer)) {
		return g.token, nil
	}

	q := url.Values{
		"env": {g.cfg.Miljoe},
		"app": {g.cfg.App},
		"ttl": {strconv.FormatInt(int64(g.cfg.TTL/time.Second), 10)},
	}
	if g.cfg.Org != "" {
		q.Set("org", g.cfg.Org)
	}
	hentet := g.naa()
	token, err := g.hent(ctx, platformTokenPath, q)
	if err != nil {
		return "", err
	}
	g.token = token
	g.utloeper = hentet.Add(g.cfg.TTL)
	return g.token, nil
}

func (g *PlatformTokenGenerator) hent(ctx context.Context, sti string, q url.Values) (string, error) {
	u := g.cfg.BaseURL + sti + "?" + q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return "", fmt.Errorf("%w: %v", ErrInvalid, err)
	}
	req.SetBasicAuth(g.cfg.Brukernavn, g.cfg.Passord)

	resp, err := g.http.Do(req)
	if err != nil {
		return "", fmt.Errorf("%w: token generator: %v", ErrConnection, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("%w: token generator: les svar: %v", ErrConnection, err)
	}
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("%w: token generator svarte HTTP %d på %s: %s",
			ErrInvalidResponse, resp.StatusCode, sti, strings.TrimSpace(string(body)))
	}
	token := strings.TrimSpace(string(body))
	if token == "" {
		return "", fmt.Errorf("%w: token generator svarte uten token", ErrInvalidResponse)
	}
	return token, nil
}

// forste returnerer den første verdien som ikke er tom.
func forste(verdier ...string) string {
	for _, v := range verdier {
		if v != "" {
			return v
		}
	}
	return ""
}
