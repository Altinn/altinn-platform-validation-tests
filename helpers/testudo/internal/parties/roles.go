package parties

// Tilretteleggere: revisor, regnskapsfører and forretningsfører. Tenor has no
// field on the tilrettelegger itself that says which role it has, so they are
// found through the clients: the clients have the field (e.g. revisorerOrgnr)
// and the tilrettelegger as a role in rollegrupper.

import (
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"strings"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

// Role is a role an organization can have for its clients.
type Role struct {
	// Name is the name of the role, e.g. revisor.
	Name string
	// Field is the field on the client that points to the tilrettelegger.
	Field string
	// Code is the role code in the client's rollegrupper.
	Code string
}

// Roles are the roles FindOrganizations can fetch tilretteleggere for.
var Roles = []Role{
	{Name: "revisor", Field: "revisorerOrgnr", Code: "REVI"},
	{Name: "regnskapsfoerer", Field: "regnskapsfoerereOrgnr", Code: "REGN"},
	{Name: "forretningsfoerer", Field: "forretningsfoerereOrgnr", Code: "FFØR"},
}

// RoleNames are the names in Roles, for help texts and error messages.
func RoleNames() string {
	names := make([]string, len(Roles))
	for i, r := range Roles {
		names[i] = r.Name
	}
	return strings.Join(names, ", ")
}

// FindRole looks up the role with the name.
func FindRole(name string) (Role, error) {
	i := slices.IndexFunc(Roles, func(r Role) bool { return r.Name == name })
	if i < 0 {
		return Role{}, fmt.Errorf("%w: unknown role %q, use one of %s", errs.Invalid, name, RoleNames())
	}
	return Roles[i], nil
}

// tilretteleggerePerSearch is how many tilretteleggere are fetched in one
// search with organisasjonsnummer:(a or b ...).
const tilretteleggerePerSearch = 50

// tilretteleggerFromClient reads the organization number of the
// tilrettelegger with the role code from a client's rollegrupper, or an empty
// string.
func tilretteleggerFromClient(md tenor.Metadata, code string) string {
	var kildedata struct {
		Rollegrupper []rollegruppe `json:"rollegrupper"`
	}
	if json.Unmarshal([]byte(md.Kildedata), &kildedata) != nil {
		return ""
	}
	for _, g := range kildedata.Rollegrupper {
		if g.Type.Kode != code {
			continue
		}
		for _, r := range g.Roller {
			if r.Fratraadt != "J" && organizationNumberRe.MatchString(r.Virksomhet.Organisasjonsnummer) {
				return r.Virksomhet.Organisasjonsnummer
			}
		}
	}
	return ""
}

// fetchTilretteleggere fetches count tilretteleggere with the role and a
// person with personRole, or a leader when it is empty.
//
// It is done in three steps: clients are scanned until we have enough unique
// candidates, the candidates' own documents are fetched many at a time, and
// then they are filtered on the person. More candidates than count are
// fetched, since some are dropped.
func fetchTilretteleggere(ctx context.Context, c *tenor.Client, role Role, personRole PersonRole, count int) ([]organizationCandidate, error) {
	candidateCount := 2*count + 10

	// Many clients share a tilrettelegger, so only clients that give a new
	// candidate are kept.
	var organizationNumbers []string
	seen := map[string]bool{}
	newCandidate := func(md tenor.Metadata) bool {
		organizationNumber := tilretteleggerFromClient(md, role.Code)
		if organizationNumber == "" || seen[organizationNumber] {
			return false
		}
		seen[organizationNumber] = true
		organizationNumbers = append(organizationNumbers, organizationNumber)
		return true
	}
	if _, err := c.FetchManyFiltered(ctx, tenor.SourceBrreg, tenor.Exists(role.Field), candidateCount, newCandidate); err != nil {
		return nil, err
	}

	documents, err := fetchByOrganizationNumber(ctx, c, organizationNumbers)
	if err != nil {
		return nil, err
	}
	tilretteleggere := make([]organizationCandidate, 0, len(organizationNumbers))
	for _, organizationNumber := range organizationNumbers {
		md, ok := documents[organizationNumber]
		if !ok {
			continue
		}
		k, ok := toOrganizationCandidate(md, personRole)
		if !ok || k.person == "" {
			continue
		}
		k.role = role.Name
		tilretteleggere = append(tilretteleggere, k)
	}
	return tilretteleggere[:min(count, len(tilretteleggere))], nil
}

// fetchByOrganizationNumber fetches the brreg documents of the organizations,
// many at a time.
func fetchByOrganizationNumber(ctx context.Context, c *tenor.Client, organizationNumbers []string) (map[string]tenor.Metadata, error) {
	documents := make(map[string]tenor.Metadata, len(organizationNumbers))
	for start := 0; start < len(organizationNumbers); start += tilretteleggerePerSearch {
		batch := organizationNumbers[start:min(start+tilretteleggerePerSearch, len(organizationNumbers))]
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
				documents[md.ID] = md
			}
		}
	}
	return documents, nil
}
