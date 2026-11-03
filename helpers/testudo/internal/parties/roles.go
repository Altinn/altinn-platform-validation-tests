package parties

// Tilretteleggere: revisor, regnskapsfører og forretningsfører. Tenor har
// ikke noe felt på tilretteleggeren selv som sier hvilken rolle den har, så de
// finnes via klientene: klientene har feltet (f.eks. revisorerOrgnr) og
// tilretteleggeren som en rolle i rollegrupper.

import (
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"strings"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

// Role er en rolle en virksomhet kan ha for klientene sine.
type Role struct {
	// Name er navnet på rollen, f.eks. revisor.
	Name string
	// Field er feltet på klienten som peker på tilretteleggeren.
	Field string
	// Code er rollekoden i klientens rollegrupper.
	Code string
}

// Roles er rollene FindOrganizations kan hente tilretteleggere for.
var Roles = []Role{
	{Name: "revisor", Field: "revisorerOrgnr", Code: "REVI"},
	{Name: "regnskapsfoerer", Field: "regnskapsfoerereOrgnr", Code: "REGN"},
	{Name: "forretningsfoerer", Field: "forretningsfoerereOrgnr", Code: "FFØR"},
}

// RoleNames er navnene i Roles, til hjelpetekst og feilmeldinger.
func RoleNames() string {
	navn := make([]string, len(Roles))
	for i, r := range Roles {
		navn[i] = r.Name
	}
	return strings.Join(navn, ", ")
}

// FindRole slår opp rollen med navnet.
func FindRole(name string) (Role, error) {
	i := slices.IndexFunc(Roles, func(r Role) bool { return r.Name == name })
	if i < 0 {
		return Role{}, fmt.Errorf("%w: ukjent rolle %q, bruk en av %s", errs.Invalid, name, RoleNames())
	}
	return Roles[i], nil
}

// tilretteleggerOppslagPerKall er hvor mange tilretteleggere som hentes i ett
// søk med organisasjonsnummer:(a or b ...).
const tilretteleggerOppslagPerKall = 50

// tilretteleggerFraKlient leser organisasjonsnummeret til tilretteleggeren med
// rollekode fra en klients rollegrupper, eller tom tekst.
func tilretteleggerFraKlient(md tenor.Metadata, kode string) string {
	var kildedata struct {
		Rollegrupper []rollegruppe `json:"rollegrupper"`
	}
	if json.Unmarshal([]byte(md.Kildedata), &kildedata) != nil {
		return ""
	}
	for _, g := range kildedata.Rollegrupper {
		if g.Type.Kode != kode {
			continue
		}
		for _, r := range g.Roller {
			if r.Fratraadt != "J" && organisasjonsnummerRe.MatchString(r.Virksomhet.Organisasjonsnummer) {
				return r.Virksomhet.Organisasjonsnummer
			}
		}
	}
	return ""
}

// hentTilretteleggere henter antall tilretteleggere med rollen og leder (se
// leder).
//
// Det gjøres i tre steg: klienter skannes til vi har nok unike kandidater,
// kandidatenes egne dokumenter hentes mange om gangen, og så filtreres de på
// leder. Det hentes flere kandidater enn antall, siden noen forkastes.
func hentTilretteleggere(ctx context.Context, c *tenor.Client, rolle Role, antall int) ([]virksomhetKandidat, error) {
	kandidater := 2*antall + 10

	// Mange klienter deler tilrettelegger, så bare klienter som gir en ny
	// kandidat beholdes.
	var orgnumre []string
	sett := map[string]bool{}
	nyKandidat := func(md tenor.Metadata) bool {
		orgnr := tilretteleggerFraKlient(md, rolle.Code)
		if orgnr == "" || sett[orgnr] {
			return false
		}
		sett[orgnr] = true
		orgnumre = append(orgnumre, orgnr)
		return true
	}
	if _, err := c.FetchManyFiltered(ctx, tenor.SourceBrreg, tenor.Exists(rolle.Field), kandidater, nyKandidat); err != nil {
		return nil, err
	}

	dokumenter, err := hentPaaOrganisasjonsnummer(ctx, c, orgnumre)
	if err != nil {
		return nil, err
	}
	tilretteleggere := make([]virksomhetKandidat, 0, len(orgnumre))
	for _, orgnr := range orgnumre {
		md, ok := dokumenter[orgnr]
		if !ok {
			continue
		}
		k, ok := tilVirksomhetKandidat(md)
		if !ok || k.leder == "" {
			continue
		}
		k.rolle = rolle.Name
		tilretteleggere = append(tilretteleggere, k)
	}
	return tilretteleggere[:min(antall, len(tilretteleggere))], nil
}

// hentPaaOrganisasjonsnummer henter brreg-dokumentene til virksomhetene, mange
// om gangen.
func hentPaaOrganisasjonsnummer(ctx context.Context, c *tenor.Client, orgnumre []string) (map[string]tenor.Metadata, error) {
	dokumenter := make(map[string]tenor.Metadata, len(orgnumre))
	for start := 0; start < len(orgnumre); start += tilretteleggerOppslagPerKall {
		batch := orgnumre[start:min(start+tilretteleggerOppslagPerKall, len(orgnumre))]
		res, err := c.Search(ctx, tenor.SourceBrreg, tenor.SearchParams{
			KQL:    "organisasjonsnummer:(" + strings.Join(batch, " or ") + ")",
			Antall: tenor.Ptr(int32(len(batch))),
			Vis:    []string{"tenorMetadata"},
		})
		if err != nil {
			return nil, err
		}
		for _, d := range res.DokumentListe {
			md, err := tenor.ReadMetadata(d)
			if err == nil && md.ID != "" {
				dokumenter[md.ID] = md
			}
		}
	}
	return dokumenter, nil
}
