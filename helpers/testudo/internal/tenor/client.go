// Package tenor er en klient for Tenor sitt Søke-API (OpenAPI "Søke API" v0,
// https://testdata.api.skatteetaten.no/api/testnorge/v2), med hjelpere for å
// bygge KQL.
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
	// DefaultBaseURL er Tenor sitt API.
	DefaultBaseURL = "https://testdata.api.skatteetaten.no"
	// Scope er Maskinporten-scopet tokenet må ha.
	Scope    = "skatteetaten:testnorge/testdata.read"
	soekPath = "/api/testnorge/v2/soek"
)

// Source er en Tenor-kilde, brukt som {kilde} i søkestien.
type Source string

const (
	// SourceFreg er Folkeregisteret (personer).
	SourceFreg Source = "freg"
	// SourceBrreg er Enhets- og Foretaksregisteret (virksomheter).
	SourceBrreg Source = "brreg-er-fr"
)

// Result er svaret fra både /soek/{kilde} og /soek/{kilde}/uthenting.
type Result struct {
	Treff  int64 `json:"treff"`
	Rader  int32 `json:"rader"`
	Offset int32 `json:"offset"`
	// NesteSide er nil når det ikke finnes flere sider.
	NesteSide *int32 `json:"nesteSide"`
	// Seed må sendes med på påfølgende sider for stabil rekkefølge.
	Seed int32 `json:"seed"`
	// DokumentListe er utypet i spec'en; innholdet avhenger av kilden.
	DokumentListe []json.RawMessage    `json:"dokumentListe"`
	Highlight     map[string]Highlight `json:"highlight"`
}

type Highlight struct {
	PrimaerKildeTreff   bool                `json:"primaerKildeTreff"`
	SekundaerKildeTreff map[string][]string `json:"sekundaerKildeTreff"`
}

// SearchParams er query-parametrene til /soek/{kilde}. Nil/tomme felt sendes
// ikke, slik at Tenor bruker sine egne standardverdier.
type SearchParams struct {
	// KQL er spørringen i Kibana Query Language.
	KQL    string
	Antall *int32
	// Side brukes sammen med Seed for konsistent bla i resultatet.
	Side *int32
	Seed *int32
	// Vis angir felt som skal returneres, f.eks. "tenorMetadata" eller "*".
	Vis []string
	// Skjul angir felt som skal skjules.
	Skjul []string
	// Nokkelinformasjon viser samme felt som nøkkelinformasjon i GUI og
	// overstyrer Vis/Skjul.
	Nokkelinformasjon bool
}

// ExtractParams er query-parametrene til /soek/{kilde}/uthenting.
type ExtractParams struct {
	KQL    string
	Antall *int32
	Side   *int32
	Seed   *int32
}

// TokenSource gir et gyldig bearer-token med scope Scope.
type TokenSource interface {
	Token(ctx context.Context) (string, error)
}

// StaticToken er et ferdig utstedt token, f.eks. til tester eller manuell bruk.
type StaticToken string

func (t StaticToken) Token(context.Context) (string, error) {
	return string(t), nil
}

type Client struct {
	baseURL string
	http    *http.Client
	tokens  TokenSource
}

// NewClient lager en klient mot baseURL, som er DefaultBaseURL utenom i
// tester.
func NewClient(baseURL string, tokens TokenSource) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		http:    &http.Client{Timeout: 10 * time.Second},
		tokens:  tokens,
	}
}

// Search kjører GET /soek/{kilde}.
func (c *Client) Search(ctx context.Context, kilde Source, p SearchParams) (*Result, error) {
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
	return c.get(ctx, kilde, "", q)
}

// Extract kjører GET /soek/{kilde}/uthenting.
func (c *Client) Extract(ctx context.Context, kilde Source, p ExtractParams) (*Result, error) {
	q := url.Values{}
	setString(q, "kql", p.KQL)
	setInt(q, "antall", p.Antall)
	setInt(q, "side", p.Side)
	setInt(q, "seed", p.Seed)
	return c.get(ctx, kilde, "/uthenting", q)
}

// Count returnerer antall treff for en spørring uten å hente dokumenter.
func (c *Client) Count(ctx context.Context, kilde Source, kql string) (int64, error) {
	res, err := c.Search(ctx, kilde, SearchParams{KQL: kql, Antall: Ptr[int32](0)})
	if err != nil {
		return 0, err
	}
	return res.Treff, nil
}

// MaxPerPage er det høyeste antallet dokumenter Tenor returnerer per
// søk. Tenor stopper også bla etter de første 200 treffene (nesteSide blir
// nil), så side kan ikke brukes for å komme forbi grensen.
const MaxPerPage = 200

// FetchMany henter opptil antall unike dokumenter, også forbi grensen på 200.
// Hver seed gir en egen tilfeldig rekkefølge, så vi henter de første 200
// treffene for flere seeds og fjerner duplikater på tenorMetadata.id
// (fødselsnummer for freg, organisasjonsnummer for brreg-er-fr).
// Første kall er uten seed, så utvalget blir tilfeldig fra gang til gang.
func (c *Client) FetchMany(ctx context.Context, kilde Source, kql string, antall int) ([]Metadata, error) {
	return c.FetchManyFiltered(ctx, kilde, kql, antall, nil)
}

// FetchManyFiltered er FetchMany, men tar bare med dokumenter der behold gir
// true. Det er for krav KQL ikke kan uttrykke, f.eks. at en virksomhet har
// daglig leder. Siden noen dokumenter forkastes, hentes flere per kall og i
// flere runder enn uten filter.
func (c *Client) FetchManyFiltered(ctx context.Context, kilde Source, kql string, antall int, behold func(Metadata) bool) ([]Metadata, error) {
	if antall <= 0 {
		return nil, nil
	}
	perSide := int32(min(antall, MaxPerPage))
	// Noen ekstra runder i tilfelle overlapp mellom seeds.
	maksRunder := (antall+MaxPerPage-1)/MaxPerPage + 5
	if behold != nil {
		perSide = int32(min(max(2*antall, 20), MaxPerPage))
		maksRunder += 15
	}

	sett := make(map[string]bool, antall)
	dokumenter := make([]Metadata, 0, antall)
	var seed *int32
	for runde := 0; runde < maksRunder && len(dokumenter) < antall; runde++ {
		res, err := c.Search(ctx, kilde, SearchParams{
			KQL:    kql,
			Antall: Ptr(perSide),
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
			if err != nil || md.ID == "" || sett[md.ID] {
				continue
			}
			sett[md.ID] = true
			if behold != nil && !behold(md) {
				continue
			}
			dokumenter = append(dokumenter, md)
			if len(dokumenter) == antall {
				break
			}
		}
		// Alle treffene er sett, også de som ble forkastet.
		if int64(len(sett)) >= res.Treff {
			break
		}
		seed = Ptr(res.Seed + 1)
	}
	return dokumenter, nil
}

func (c *Client) get(ctx context.Context, kilde Source, suffix string, q url.Values) (*Result, error) {
	if kilde == "" {
		return nil, fmt.Errorf("%w: kilde mangler", errs.Invalid)
	}
	token, err := c.tokens.Token(ctx)
	if err != nil {
		return nil, fmt.Errorf("hent token: %w", err)
	}

	u := c.baseURL + soekPath + "/" + url.PathEscape(string(kilde)) + suffix
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
		return nil, fmt.Errorf("%w: les svar: %v", errs.Connection, err)
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

// Metadata er feltet tenorMetadata i hvert dokument. Det står ikke i
// spec'en; strukturen er hentet fra hvordan API-et faktisk svarer.
type Metadata struct {
	// ID er fødselsnummer for freg og organisasjonsnummer for brreg-er-fr.
	ID string `json:"id"`
	// Kildedata er selve kildedokumentet som en JSON-streng.
	Kildedata string `json:"kildedata"`
	// Opprettet og Oppdatert holdes som tekst siden datoformatet ikke er
	// dokumentert.
	Opprettet string `json:"opprettet"`
	Oppdatert string `json:"oppdatert"`
}

// ReadMetadata henter tenorMetadata fra et dokument i DokumentListe.
// Krever at søket ble gjort med Vis som inkluderer "tenorMetadata".
func ReadMetadata(dokument json.RawMessage) (Metadata, error) {
	var d struct {
		Metadata *Metadata `json:"tenorMetadata"`
	}
	if err := json.Unmarshal(dokument, &d); err != nil {
		return Metadata{}, fmt.Errorf("%w: %v", errs.InvalidResponse, err)
	}
	if d.Metadata == nil {
		return Metadata{}, fmt.Errorf("%w: dokumentet mangler tenorMetadata", errs.InvalidResponse)
	}
	return *d.Metadata, nil
}

// Ptr gjør det enkelt å sette valgfrie felt, f.eks. Antall: Ptr[int32](200).
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
