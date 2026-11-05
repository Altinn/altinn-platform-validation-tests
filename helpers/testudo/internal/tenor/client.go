// Package tenor is a client for Tenor's search API (OpenAPI "Søke API" v0,
// https://testdata.api.skatteetaten.no/api/testnorge/v2), with helpers for
// building KQL.
package tenor

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

const (
	// DefaultBaseURL is Tenor's API.
	DefaultBaseURL = "https://testdata.api.skatteetaten.no"
	// Scope is the Maskinporten scope the token must have.
	Scope      = "skatteetaten:testnorge/testdata.read"
	searchPath = "/api/testnorge/v2/soek"
)

// Source is a Tenor source, used as {kilde} in the search path.
type Source string

const (
	// SourceFreg is Folkeregisteret (persons).
	SourceFreg Source = "freg"
	// SourceBrreg is Enhets- og Foretaksregisteret (organizations).
	SourceBrreg Source = "brreg-er-fr"
)

// Result is the response from both /soek/{kilde} and /soek/{kilde}/uthenting.
type Result struct {
	Treff  int64 `json:"treff"`
	Rader  int32 `json:"rader"`
	Offset int32 `json:"offset"`
	// NesteSide is nil when there are no more pages.
	NesteSide *int32 `json:"nesteSide"`
	// Seed must be sent on the following pages for a stable order.
	Seed int32 `json:"seed"`
	// DokumentListe is untyped in the spec; the content depends on the source.
	DokumentListe []json.RawMessage    `json:"dokumentListe"`
	Highlight     map[string]Highlight `json:"highlight"`
}

type Highlight struct {
	PrimaerKildeTreff   bool                `json:"primaerKildeTreff"`
	SekundaerKildeTreff map[string][]string `json:"sekundaerKildeTreff"`
}

// SearchParams are the query parameters of /soek/{kilde}. Nil or empty fields
// are not sent, so Tenor uses its own defaults.
type SearchParams struct {
	// KQL is the query in Kibana Query Language.
	KQL    string
	Antall *int32
	// Side is used together with Seed for consistent paging through the result.
	Side *int32
	Seed *int32
	// Vis lists the fields to return, e.g. "tenorMetadata" or "*".
	Vis []string
	// Skjul lists the fields to hide.
	Skjul []string
	// Nokkelinformasjon shows the same fields as the key information in the GUI
	// and overrides Vis/Skjul.
	Nokkelinformasjon bool
}

// ExtractParams are the query parameters of /soek/{kilde}/uthenting.
type ExtractParams struct {
	KQL    string
	Antall *int32
	Side   *int32
	Seed   *int32
}

// TokenSource gives a valid bearer token with scope Scope.
type TokenSource interface {
	Token(ctx context.Context) (string, error)
}

// StaticToken is an already issued token, e.g. for tests or manual use.
type StaticToken string

func (t StaticToken) Token(context.Context) (string, error) {
	return string(t), nil
}

type Client struct {
	baseURL string
	http    *http.Client
	tokens  TokenSource
}

// NewClient creates a client for baseURL, which is DefaultBaseURL except in
// tests.
func NewClient(baseURL string, tokens TokenSource) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		http:    &http.Client{Timeout: 10 * time.Second},
		tokens:  tokens,
	}
}

// Search runs GET /soek/{kilde}.
func (c *Client) Search(ctx context.Context, source Source, p SearchParams) (*Result, error) {
	q := url.Values{}
	setString(q, "kql", p.KQL)
	setInt(q, "antall", p.Antall)
	setInt(q, "side", p.Side)
	setInt(q, "seed", p.Seed)
	for _, v := range p.Vis {
		q.Add("vis", v)
	}
	for _, v := range p.Skjul {
		q.Add("skjul", v)
	}
	if p.Nokkelinformasjon {
		q.Set("nokkelinformasjon", "true")
	}
	return c.get(ctx, source, "", q)
}

// Extract runs GET /soek/{kilde}/uthenting.
func (c *Client) Extract(ctx context.Context, source Source, p ExtractParams) (*Result, error) {
	q := url.Values{}
	setString(q, "kql", p.KQL)
	setInt(q, "antall", p.Antall)
	setInt(q, "side", p.Side)
	setInt(q, "seed", p.Seed)
	return c.get(ctx, source, "/uthenting", q)
}

// Count returns the number of hits for a query without fetching documents.
func (c *Client) Count(ctx context.Context, source Source, kql string) (int64, error) {
	res, err := c.Search(ctx, source, SearchParams{KQL: kql, Antall: Ptr[int32](0)})
	if err != nil {
		return 0, err
	}
	return res.Treff, nil
}

// MaxPerPage is the highest number of documents Tenor returns per search.
// Tenor also stops paging after the first 200 hits (nesteSide becomes nil), so
// side cannot be used to get past the limit.
const MaxPerPage = 200

// FetchMany fetches up to count unique documents, also past the limit of 200.
// Each seed gives its own random order, so we fetch the first 200 hits for
// several seeds and remove duplicates on tenorMetadata.id (fødselsnummer for
// freg, organization number for brreg-er-fr).
// The first call has no seed, so the selection is random from run to run.
func (c *Client) FetchMany(ctx context.Context, source Source, kql string, count int) ([]Metadata, error) {
	return c.FetchManyFiltered(ctx, source, kql, count, nil)
}

// FetchManyFiltered is FetchMany, but only includes documents for which keep
// returns true. It is for requirements KQL cannot express, e.g. that an
// organization has a daglig leder. Since some documents are discarded, it
// fetches more per call and in more rounds than without a filter.
func (c *Client) FetchManyFiltered(ctx context.Context, source Source, kql string, count int, keep func(Metadata) bool) ([]Metadata, error) {
	if count <= 0 {
		return nil, nil
	}
	perPage := int32(min(count, MaxPerPage))
	// A few extra rounds in case seeds overlap.
	maxRounds := (count+MaxPerPage-1)/MaxPerPage + 5
	if keep != nil {
		perPage = int32(min(max(2*count, 20), MaxPerPage))
		maxRounds += 15
	}

	seen := make(map[string]bool, count)
	docs := make([]Metadata, 0, count)
	var seed *int32
	for round := 0; round < maxRounds && len(docs) < count; round++ {
		res, err := c.Search(ctx, source, SearchParams{
			KQL:    kql,
			Antall: Ptr(perPage),
			Side:   Ptr[int32](0),
			Seed:   seed,
			Vis:    []string{"tenorMetadata"},
		})
		if err != nil {
			return nil, err
		}
		if len(res.DokumentListe) == 0 {
			break
		}
		for _, d := range res.DokumentListe {
			md, err := ReadMetadata(d)
			if err != nil || md.ID == "" || seen[md.ID] {
				continue
			}
			seen[md.ID] = true
			if keep != nil && !keep(md) {
				continue
			}
			docs = append(docs, md)
			if len(docs) == count {
				break
			}
		}
		// All hits have been seen, including the discarded ones.
		if int64(len(seen)) >= res.Treff {
			break
		}
		seed = Ptr(res.Seed + 1)
	}
	return docs, nil
}

func (c *Client) get(ctx context.Context, source Source, suffix string, q url.Values) (*Result, error) {
	if source == "" {
		return nil, fmt.Errorf("%w: source is missing", errs.Invalid)
	}
	token, err := c.tokens.Token(ctx)
	if err != nil {
		return nil, fmt.Errorf("get token: %w", err)
	}

	u := c.baseURL + searchPath + "/" + url.PathEscape(string(source)) + suffix
	if len(q) > 0 {
		u += "?" + q.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", errs.Invalid, err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", errs.Connection, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("%w: read response: %v", errs.Connection, err)
	}
	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("%w: %s (KQL: %s)", errs.NotFound, u, q.Get("kql"))
	}
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return nil, fmt.Errorf("%w: HTTP %d: %s (KQL: %s)",
			errs.InvalidResponse, resp.StatusCode, strings.TrimSpace(string(body)), q.Get("kql"))
	}

	var res Result
	if err := json.Unmarshal(body, &res); err != nil {
		return nil, fmt.Errorf("%w: %v", errs.InvalidResponse, err)
	}
	return &res, nil
}

// Metadata is the field tenorMetadata in each document. It is not in the
// spec; the structure is taken from how the API actually responds.
type Metadata struct {
	// ID is the fødselsnummer for freg and the organization number for
	// brreg-er-fr.
	ID string `json:"id"`
	// Kildedata is the source document itself as a JSON string.
	Kildedata string `json:"kildedata"`
	// Opprettet and Oppdatert are kept as text since the date format is not
	// documented.
	Opprettet string `json:"opprettet"`
	Oppdatert string `json:"oppdatert"`
}

// ReadMetadata reads tenorMetadata from a document in DokumentListe.
// Requires that the search was made with Vis including "tenorMetadata".
func ReadMetadata(doc json.RawMessage) (Metadata, error) {
	var d struct {
		Metadata *Metadata `json:"tenorMetadata"`
	}
	if err := json.Unmarshal(doc, &d); err != nil {
		return Metadata{}, fmt.Errorf("%w: %v", errs.InvalidResponse, err)
	}
	if d.Metadata == nil {
		return Metadata{}, fmt.Errorf("%w: the document has no tenorMetadata", errs.InvalidResponse)
	}
	return *d.Metadata, nil
}

// Ptr makes it easy to set optional fields, e.g. Antall: Ptr[int32](200).
func Ptr[T any](v T) *T {
	return &v
}

func setString(q url.Values, key, v string) {
	if v != "" {
		q.Set(key, v)
	}
}

func setInt(q url.Values, key string, v *int32) {
	if v != nil {
		q.Set(key, strconv.FormatInt(int64(*v), 10))
	}
}
