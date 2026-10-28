package cmd

// Klient for Tenor sitt Søke-API (OpenAPI "Søke API" v0,
// https://testdata.api.skatteetaten.no/api/testnorge/v2).

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

var (
	ErrConnection      = errors.New("Connection error")
	ErrNotFound        = errors.New("Not found")
	ErrInvalidResponse = errors.New("Invalid server response")
	ErrInvalid         = errors.New("Invalid data")
)

var (
	tenorBaseUrl  = "https://testdata.api.skatteetaten.no"
	tenorSoekPath = "/api/testnorge/v2/soek"
	tenorScope    = "skatteetaten:testnorge/testdata.read"
)

// Kilde er en Tenor-kilde, brukt som {kilde} i søkestien.
type Kilde string

const (
	// KildeFreg er Folkeregisteret (personer).
	KildeFreg Kilde = "freg"
	// KildeBrreg er Enhets- og Foretaksregisteret (virksomheter).
	KildeBrreg Kilde = "brreg-er-fr"
)

// Resultat er svaret fra både /soek/{kilde} og /soek/{kilde}/uthenting.
type Resultat struct {
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

// SoekParams er query-parametrene til /soek/{kilde}. Nil/tomme felt sendes
// ikke, slik at Tenor bruker sine egne standardverdier.
type SoekParams struct {
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

// UthentingParams er query-parametrene til /soek/{kilde}/uthenting.
type UthentingParams struct {
	KQL    string
	Antall *int32
	Side   *int32
	Seed   *int32
}

// TokenSource gir et gyldig bearer-token med scope tenorScope.
type TokenSource interface {
	Token(ctx context.Context) (string, error)
}

// StaticToken er et ferdig utstedt token, f.eks. til tester eller manuell bruk.
type StaticToken string

func (t StaticToken) Token(context.Context) (string, error) {
	return string(t), nil
}

type TenorClient struct {
	baseURL string
	http    *http.Client
	tokens  TokenSource
}

func NewTenorClient(tokens TokenSource) *TenorClient {
	return &TenorClient{
		baseURL: tenorBaseUrl,
		http:    newClient(),
		tokens:  tokens,
	}
}

// Soek kjører GET /soek/{kilde}.
func (c *TenorClient) Soek(ctx context.Context, kilde Kilde, p SoekParams) (*Resultat, error) {
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

// Uthenting kjører GET /soek/{kilde}/uthenting.
func (c *TenorClient) Uthenting(ctx context.Context, kilde Kilde, p UthentingParams) (*Resultat, error) {
	q := url.Values{}
	setString(q, "kql", p.KQL)
	setInt(q, "antall", p.Antall)
	setInt(q, "side", p.Side)
	setInt(q, "seed", p.Seed)
	return c.get(ctx, kilde, "/uthenting", q)
}

// Tell returnerer antall treff for en spørring uten å hente dokumenter.
func (c *TenorClient) Tell(ctx context.Context, kilde Kilde, kql string) (int64, error) {
	res, err := c.Soek(ctx, kilde, SoekParams{KQL: kql, Antall: Ptr[int32](0)})
	if err != nil {
		return 0, err
	}
	return res.Treff, nil
}

// TenorMaksPerSide er det høyeste antallet dokumenter Tenor returnerer per
// søk. Tenor stopper også bla etter de første 200 treffene (nesteSide blir
// nil), så side kan ikke brukes for å komme forbi grensen.
const TenorMaksPerSide = 200

// HentMange henter opptil antall unike dokumenter, også forbi grensen på 200.
// Hver seed gir en egen tilfeldig rekkefølge, så vi henter de første 200
// treffene for flere seeds og fjerner duplikater på tenorMetadata.id
// (fødselsnummer for freg, organisasjonsnummer for brreg-er-fr).
// Første kall er uten seed, så utvalget blir tilfeldig fra gang til gang.
func (c *TenorClient) HentMange(ctx context.Context, kilde Kilde, kql string, antall int) ([]TenorMetadata, error) {
	return c.HentMangeFiltrert(ctx, kilde, kql, antall, nil)
}

// HentMangeFiltrert er HentMange, men tar bare med dokumenter der behold gir
// true. Det er for krav KQL ikke kan uttrykke, f.eks. at en virksomhet har
// daglig leder. Siden noen dokumenter forkastes, hentes flere per kall og i
// flere runder enn uten filter.
func (c *TenorClient) HentMangeFiltrert(ctx context.Context, kilde Kilde, kql string, antall int, behold func(TenorMetadata) bool) ([]TenorMetadata, error) {
	if antall <= 0 {
		return nil, nil
	}
	perSide := int32(min(antall, TenorMaksPerSide))
	// Noen ekstra runder i tilfelle overlapp mellom seeds.
	maksRunder := (antall+TenorMaksPerSide-1)/TenorMaksPerSide + 5
	if behold != nil {
		perSide = int32(min(max(2*antall, 20), TenorMaksPerSide))
		maksRunder += 15
	}

	sett := make(map[string]bool, antall)
	dokumenter := make([]TenorMetadata, 0, antall)
	var seed *int32
	for runde := 0; runde < maksRunder && len(dokumenter) < antall; runde++ {
		res, err := c.Soek(ctx, kilde, SoekParams{
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
			md, err := LesTenorMetadata(d)
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

func (c *TenorClient) get(ctx context.Context, kilde Kilde, suffix string, q url.Values) (*Resultat, error) {
	if kilde == "" {
		return nil, fmt.Errorf("%w: kilde mangler", ErrInvalid)
	}
	token, err := c.tokens.Token(ctx)
	if err != nil {
		return nil, fmt.Errorf("hent token: %w", err)
	}

	u := c.baseURL + tenorSoekPath + "/" + url.PathEscape(string(kilde)) + suffix
	if len(q) > 0 {
		u += "?" + q.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrInvalid, err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrConnection, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("%w: les svar: %v", ErrConnection, err)
	}
	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("%w: %s (KQL: %s)", ErrNotFound, u, q.Get("kql"))
	}
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return nil, fmt.Errorf("%w: HTTP %d: %s (KQL: %s)",
			ErrInvalidResponse, resp.StatusCode, strings.TrimSpace(string(body)), q.Get("kql"))
	}

	var res Resultat
	if err := json.Unmarshal(body, &res); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrInvalidResponse, err)
	}
	return &res, nil
}

// TenorMetadata er feltet tenorMetadata i hvert dokument. Det står ikke i
// spec'en; strukturen er hentet fra hvordan API-et faktisk svarer.
type TenorMetadata struct {
	// ID er fødselsnummer for freg og organisasjonsnummer for brreg-er-fr.
	ID string `json:"id"`
	// Kildedata er selve kildedokumentet som en JSON-streng.
	Kildedata string `json:"kildedata"`
	// Opprettet og Oppdatert holdes som tekst siden datoformatet ikke er
	// dokumentert.
	Opprettet string `json:"opprettet"`
	Oppdatert string `json:"oppdatert"`
}

// LesTenorMetadata henter tenorMetadata fra et dokument i DokumentListe.
// Krever at søket ble gjort med Vis som inkluderer "tenorMetadata".
func LesTenorMetadata(dokument json.RawMessage) (TenorMetadata, error) {
	var d struct {
		TenorMetadata *TenorMetadata `json:"tenorMetadata"`
	}
	if err := json.Unmarshal(dokument, &d); err != nil {
		return TenorMetadata{}, fmt.Errorf("%w: %v", ErrInvalidResponse, err)
	}
	if d.TenorMetadata == nil {
		return TenorMetadata{}, fmt.Errorf("%w: dokumentet mangler tenorMetadata", ErrInvalidResponse)
	}
	return *d.TenorMetadata, nil
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

func newClient() *http.Client {
	c := &http.Client{
		Timeout: 10 * time.Second,
	}
	return c
}
