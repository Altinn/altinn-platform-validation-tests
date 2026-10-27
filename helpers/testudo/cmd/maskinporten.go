package cmd

// Maskinporten-klient som henter access token med en JWT bearer grant, på
// samme måte som MaskinportenToken i altinn-access-management-frontend
// (playwright/api-requests/MaskinportenToken.ts og util/jwtHelper.ts).

import (
	"context"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

var maskinportenTokenEndpoint = "https://test.maskinporten.no/token"

const (
	// Levetiden til grant-en (exp - iat), som getCurrentTimestamps i frontend.
	maskinportenGrantLevetid = 60 * time.Second
	// Tokenet fornyes så lenge før det utløper.
	maskinportenFornyFoer = 30 * time.Second
)

// MaskinportenConfig er det som trengs for å hente token fra Maskinporten.
type MaskinportenConfig struct {
	// ClientID brukes som iss i grant-en.
	ClientID string
	// JWK er den private nøkkelen; kid i JWK-en settes i JWT-headeren.
	JWK *rsa.PrivateKey
	KID string
	// ConsumerOrg settes som consumer_org for "på vegne av"-scenarioer.
	ConsumerOrg string
	// TokenURL er både token-endepunktet og aud. Standard er testmiljøet.
	TokenURL string
}

// MaskinportenConfigFra leser MASKINPORTEN_CLIENT_ID og MASKINPORTEN_JWK med
// hent, f.eks. os.Getenv eller viper.GetString.
func MaskinportenConfigFra(hent func(string) string) (MaskinportenConfig, error) {
	cfg := MaskinportenConfig{ClientID: hent("MASKINPORTEN_CLIENT_ID")}
	if cfg.ClientID == "" {
		return cfg, fmt.Errorf("%w: MASKINPORTEN_CLIENT_ID mangler", ErrInvalid)
	}
	jwk := hent("MASKINPORTEN_JWK")
	if jwk == "" {
		return cfg, fmt.Errorf("%w: MASKINPORTEN_JWK mangler", ErrInvalid)
	}
	key, kid, err := ParsePrivatNoekkelJWK(jwk)
	if err != nil {
		return cfg, fmt.Errorf("MASKINPORTEN_JWK: %w", err)
	}
	cfg.JWK, cfg.KID = key, kid
	return cfg, nil
}

// ParsePrivatNoekkelJWK leser en privat RSA-nøkkel i JWK-format og returnerer
// nøkkelen og kid.
func ParsePrivatNoekkelJWK(s string) (*rsa.PrivateKey, string, error) {
	var jwk struct {
		Kty string `json:"kty"`
		Kid string `json:"kid"`
		N   string `json:"n"`
		E   string `json:"e"`
		D   string `json:"d"`
		P   string `json:"p"`
		Q   string `json:"q"`
	}
	if err := json.Unmarshal([]byte(s), &jwk); err != nil {
		return nil, "", fmt.Errorf("%w: JWK er ikke gyldig JSON: %v", ErrInvalid, err)
	}
	if jwk.Kty != "RSA" {
		return nil, "", fmt.Errorf("%w: JWK må ha kty RSA, har %q", ErrInvalid, jwk.Kty)
	}

	tall := map[string]*big.Int{}
	for navn, verdi := range map[string]string{"n": jwk.N, "e": jwk.E, "d": jwk.D, "p": jwk.P, "q": jwk.Q} {
		if verdi == "" {
			return nil, "", fmt.Errorf("%w: JWK mangler %q", ErrInvalid, navn)
		}
		b, err := base64.RawURLEncoding.DecodeString(verdi)
		if err != nil {
			return nil, "", fmt.Errorf("%w: JWK-feltet %q: %v", ErrInvalid, navn, err)
		}
		tall[navn] = new(big.Int).SetBytes(b)
	}
	if !tall["e"].IsInt64() {
		return nil, "", fmt.Errorf("%w: JWK har ugyldig e", ErrInvalid)
	}

	key := &rsa.PrivateKey{
		PublicKey: rsa.PublicKey{N: tall["n"], E: int(tall["e"].Int64())},
		D:         tall["d"],
		Primes:    []*big.Int{tall["p"], tall["q"]},
	}
	if err := key.Validate(); err != nil {
		return nil, "", fmt.Errorf("%w: JWK: %v", ErrInvalid, err)
	}
	key.Precompute()
	return key, jwk.Kid, nil
}

// MaskinportenClient henter og cacher access token for et sett med scopes.
// Den implementerer TokenSource.
type MaskinportenClient struct {
	cfg    MaskinportenConfig
	scopes string
	http   *http.Client
	naa    func() time.Time

	mu       sync.Mutex
	token    string
	utloeper time.Time
}

// NewMaskinportenClient lager en klient som ber om de gitte scopene.
func NewMaskinportenClient(cfg MaskinportenConfig, scopes ...string) (*MaskinportenClient, error) {
	if cfg.ClientID == "" || cfg.JWK == nil {
		return nil, fmt.Errorf("%w: Maskinporten trenger client ID og JWK", ErrInvalid)
	}
	if len(scopes) == 0 {
		return nil, fmt.Errorf("%w: minst ett scope må oppgis", ErrInvalid)
	}
	if cfg.TokenURL == "" {
		cfg.TokenURL = maskinportenTokenEndpoint
	}
	return &MaskinportenClient{
		cfg:    cfg,
		scopes: strings.Join(scopes, " "),
		http:   newClient(),
		naa:    time.Now,
	}, nil
}

// Token returnerer et gyldig access token, og henter nytt når det er nær
// ved å utløpe.
func (c *MaskinportenClient) Token(ctx context.Context) (string, error) {
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

func (c *MaskinportenClient) hentToken(ctx context.Context) (string, time.Duration, error) {
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
		return "", 0, fmt.Errorf("%w: %v", ErrInvalid, err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return "", 0, fmt.Errorf("%w: Maskinporten: %v", ErrConnection, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", 0, fmt.Errorf("%w: Maskinporten: les svar: %v", ErrConnection, err)
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
		return "", 0, fmt.Errorf("%w: Maskinporten svarte HTTP %d: %s", ErrInvalidResponse, resp.StatusCode, detaljer)
	}
	if jsonErr != nil {
		return "", 0, fmt.Errorf("%w: Maskinporten: %v", ErrInvalidResponse, jsonErr)
	}
	if svar.AccessToken == "" || svar.ExpiresIn <= 0 {
		return "", 0, fmt.Errorf("%w: Maskinporten: svaret mangler access_token eller expires_in", ErrInvalidResponse)
	}
	return svar.AccessToken, time.Duration(svar.ExpiresIn) * time.Second, nil
}

// lagGrant signerer JWT-en som sendes som assertion.
func (c *MaskinportenClient) lagGrant() (string, error) {
	jti, err := nyUUID()
	if err != nil {
		return "", err
	}
	naa := c.naa().Unix()

	header := map[string]string{"alg": "RS256", "typ": "JWT"}
	if c.cfg.KID != "" {
		header["kid"] = c.cfg.KID
	}
	payload := map[string]any{
		"aud":   c.cfg.TokenURL,
		"iss":   c.cfg.ClientID,
		"scope": c.scopes,
		"iat":   naa,
		"exp":   naa + int64(maskinportenGrantLevetid/time.Second),
		"jti":   jti,
	}
	if c.cfg.ConsumerOrg != "" {
		payload["consumer_org"] = c.cfg.ConsumerOrg
	}

	h, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	p, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}
	input := base64.RawURLEncoding.EncodeToString(h) + "." + base64.RawURLEncoding.EncodeToString(p)

	hash := sha256.Sum256([]byte(input))
	sig, err := rsa.SignPKCS1v15(rand.Reader, c.cfg.JWK, crypto.SHA256, hash[:])
	if err != nil {
		return "", fmt.Errorf("signer Maskinporten-grant: %w", err)
	}
	return input + "." + base64.RawURLEncoding.EncodeToString(sig), nil
}

// nyUUID lager en tilfeldig UUID v4.
func nyUUID() (string, error) {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	b[6] = b[6]&0x0f | 0x40
	b[8] = b[8]&0x3f | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16]), nil
}
