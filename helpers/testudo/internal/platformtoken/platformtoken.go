// Package platformtoken fetches platform access tokens from Altinn's test
// token generator, like PlatformTokenGenerator in K6/token-generator.js.
package platformtoken

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

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

const DefaultBaseURL = "https://altinn-testtools-token-generator.azurewebsites.net"

const (
	platformTokenPath = "/api/GetPlatformAccessToken"
	// defaultPlatformApp is the app name the token is issued for. K6 uses
	// k6-e2e-tests and the frontend uses testtjeneste.
	defaultPlatformApp = "testudo"
	// defaultPlatformTTL is the lifetime we ask for. The token is cached and
	// renewed, so it only needs to last a little while. K6 and the frontend
	// ask for 60000 seconds.
	defaultPlatformTTL = 5 * time.Minute
	// platformRenewBefore is how long before expiry the token is fetched again.
	platformRenewBefore = 30 * time.Second
)

// Config is what is needed to fetch a platform access token.
type Config struct {
	// Username and Password are Basic auth against the token generator.
	Username string
	Password string
	// Environment is the env parameter, e.g. at22, at23 or tt02.
	Environment string
	// App is the app the token is issued for. Default is testudo.
	App string
	// Org sets the issuer. Empty means the token generator's default.
	Org string
	// TTL is the lifetime we ask for. Default is 5 minutes.
	TTL time.Duration
	// BaseURL is the token generator. Default is Altinn's.
	BaseURL string
}

// ConfigFrom reads the username and password with lookup, using the same
// names as K6 and Playwright: TOKEN_GENERATOR_USERNAME and
// TOKEN_GENERATOR_PASSWORD.
func ConfigFrom(lookup func(string) string, env string) (Config, error) {
	cfg := Config{
		Username:    lookup("TOKEN_GENERATOR_USERNAME"),
		Password:    lookup("TOKEN_GENERATOR_PASSWORD"),
		Environment: env,
	}
	if cfg.Username == "" || cfg.Password == "" {
		return cfg, fmt.Errorf("%w: TOKEN_GENERATOR_USERNAME and TOKEN_GENERATOR_PASSWORD must be set", errs.Invalid)
	}
	if env == "" {
		return cfg, fmt.Errorf("%w: environment is missing", errs.Invalid)
	}
	return cfg, nil
}

// Generator fetches and caches platform access tokens. It can be used as
// TokenSource for register.Client.
type Generator struct {
	cfg  Config
	http *http.Client
	now  func() time.Time

	mu      sync.Mutex
	token   string
	expires time.Time
}

func NewGenerator(cfg Config) (*Generator, error) {
	if cfg.Username == "" || cfg.Password == "" || cfg.Environment == "" {
		return nil, fmt.Errorf("%w: the token generator needs a username, password and environment", errs.Invalid)
	}
	if cfg.App == "" {
		cfg.App = defaultPlatformApp
	}
	if cfg.TTL <= 0 {
		cfg.TTL = defaultPlatformTTL
	}
	if cfg.BaseURL == "" {
		cfg.BaseURL = DefaultBaseURL
	}
	cfg.BaseURL = strings.TrimRight(cfg.BaseURL, "/")
	return &Generator{cfg: cfg, http: &http.Client{Timeout: 10 * time.Second}, now: time.Now}, nil
}

// Token returns a valid platform access token.
func (g *Generator) Token(ctx context.Context) (string, error) {
	g.mu.Lock()
	defer g.mu.Unlock()

	if g.token != "" && g.now().Before(g.expires.Add(-platformRenewBefore)) {
		return g.token, nil
	}

	q := url.Values{
		"env": {g.cfg.Environment},
		"app": {g.cfg.App},
		"ttl": {strconv.FormatInt(int64(g.cfg.TTL/time.Second), 10)},
	}
	if g.cfg.Org != "" {
		q.Set("org", g.cfg.Org)
	}
	fetchedAt := g.now()
	token, err := g.fetch(ctx, platformTokenPath, q)
	if err != nil {
		return "", err
	}
	g.token = token
	g.expires = fetchedAt.Add(g.cfg.TTL)
	return g.token, nil
}

func (g *Generator) fetch(ctx context.Context, path string, q url.Values) (string, error) {
	u := g.cfg.BaseURL + path + "?" + q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return "", fmt.Errorf("%w: %v", errs.Invalid, err)
	}
	req.SetBasicAuth(g.cfg.Username, g.cfg.Password)

	resp, err := g.http.Do(req)
	if err != nil {
		return "", fmt.Errorf("%w: token generator: %v", errs.Connection, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("%w: token generator: read response: %v", errs.Connection, err)
	}
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("%w: token generator responded with HTTP %d on %s: %s",
			errs.InvalidResponse, resp.StatusCode, path, strings.TrimSpace(string(body)))
	}
	token := strings.TrimSpace(string(body))
	if token == "" {
		return "", fmt.Errorf("%w: token generator responded without a token", errs.InvalidResponse)
	}
	return token, nil
}
