// Package selfservice is a read-only client for Digdir's self-service API for
// Maskinporten clients (https://docs.digdir.no/docs/idporten/oidc/oidc_api_admin.html).
// The operationIds in the swagger are generated (get, get_2), so the methods
// are named after what they do.
package selfservice

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

const DefaultBaseURL = "https://api.test.samarbeid.digdir.no"

// ReadScope is the Maskinporten scope the token needs.
const ReadScope = "idporten:dcr.read"

type ClientResponse struct {
	ClientID               string   `json:"client_id"`
	ClientName             string   `json:"client_name"`
	ClientOrgno            string   `json:"client_orgno"`
	ClientOrganizationName string   `json:"client_organization_name"`
	Description            string   `json:"description"`
	Active                 bool     `json:"active"`
	Created                string   `json:"created"`
	LastUpdated            string   `json:"last_updated"`
	IntegrationType        string   `json:"integration_type"`
	Scopes                 []string `json:"scopes"`
}

type JSONWebKey struct {
	Kty string `json:"kty"`
	Kid string `json:"kid"`
	Use string `json:"use"`
	Alg string `json:"alg"`
	// Exp is when the key expires, in Unix seconds.
	Exp         int64  `json:"exp"`
	Created     string `json:"created"`
	LastUpdated string `json:"last_updated"`
}

// Expires is Exp as a time, or zero when the key has no exp.
func (k JSONWebKey) Expires() time.Time {
	if k.Exp == 0 {
		return time.Time{}
	}
	return time.Unix(k.Exp, 0)
}

type TokenSource interface {
	Token(ctx context.Context) (string, error)
}

type Client struct {
	baseURL string
	http    *http.Client
	tokens  TokenSource
}

func NewClient(baseURL string, tokens TokenSource) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		http:    &http.Client{Timeout: 10 * time.Second},
		tokens:  tokens,
	}
}

// GetClient is GET /api/v1/clients/{id}.
func (c *Client) GetClient(ctx context.Context, clientID string) (*ClientResponse, error) {
	var out ClientResponse
	if err := c.get(ctx, "/api/v1/clients/"+url.PathEscape(clientID), &out); err != nil {
		return nil, err
	}
	return &out, nil
}

// GetJWKS is GET /api/v1/clients/{clientId}/jwks.
func (c *Client) GetJWKS(ctx context.Context, clientID string) ([]JSONWebKey, error) {
	var out struct {
		Keys []JSONWebKey `json:"keys"`
	}
	if err := c.get(ctx, "/api/v1/clients/"+url.PathEscape(clientID)+"/jwks", &out); err != nil {
		return nil, err
	}
	return out.Keys, nil
}

func (c *Client) get(ctx context.Context, path string, out any) error {
	token, err := c.tokens.Token(ctx)
	if err != nil {
		return fmt.Errorf("get Maskinporten token: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
	if err != nil {
		return fmt.Errorf("%w: %v", errs.Invalid, err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("%w: self-service API: %v", errs.Connection, err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("%w: self-service API: read response: %v", errs.Connection, err)
	}

	switch {
	case resp.StatusCode == http.StatusNotFound:
		return fmt.Errorf("%w: self-service API: %s", errs.NotFound, path)
	case resp.StatusCode != http.StatusOK:
		return fmt.Errorf("%w: self-service API responded with HTTP %d on %s: %s", errs.InvalidResponse, resp.StatusCode, path, strings.TrimSpace(string(body)))
	}
	if err := json.Unmarshal(body, out); err != nil {
		return fmt.Errorf("%w: self-service API: %v", errs.InvalidResponse, err)
	}
	return nil
}
