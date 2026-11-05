package parties

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

// UnitTypes are the unit types FindOrganizations can fetch, with the codes
// from Enhetsregisteret: aksjeselskap, enkeltpersonforetak,
// eierseksjonssameie, borettslag and norskregistrert utenlandsk foretak.
// Their underenheter are fetched with OrganizationQuery.Subunits.
var UnitTypes = []string{"AS", "ENK", "ESEK", "BRL", "NUF"}

// DefaultUnitType is the unit type fetched when none is chosen.
const DefaultUnitType = "AS"

// styrelederUnitTypes are the unit types that rarely have a daglig leder,
// and where the styreleder is the leader.
var styrelederUnitTypes = []string{"ESEK", "BRL"}

// underenhetUnitTypes are the underenheter, of hovedenheter with and without
// business activity. They have no person roles of their own, so the person
// is from the hovedenhet, which is the role with the same code (BEDR or
// AAFY) in Enhetsregisteret. Access Management sets ParentId from it.
var underenhetUnitTypes = []string{"BEDR", "AAFY"}

// FindUnitType looks up the unit type in UnitTypes, ignoring case.
func FindUnitType(name string) (string, error) {
	code := strings.ToUpper(name)
	if !slices.Contains(UnitTypes, code) {
		return "", fmt.Errorf("%w: unknown unit type %q, use one of %s", errs.Invalid, name, strings.Join(UnitTypes, ", "))
	}
	return code, nil
}

// ValidOrganizationNumber reports whether s looks like an organization
// number (9 digits).
func ValidOrganizationNumber(s string) bool {
	return organizationNumberRe.MatchString(s)
}

// Organization is an organization from brreg-er-fr where both the
// organization and the person exist in Register for the environment.
// Everything about them is from Register. Only Kildedata, and who the person
// is, is from Tenor.
type Organization struct {
	// Role is the tilrettelegger role when the organization was fetched with
	// a role.
	Role string `json:"role,omitempty"`
	// Kildedata is the whole brreg document from Tenor.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
	// Party is the organization in Register. In JSON its fields are at the
	// same level as role and kildedata.
	register.Party
	// PersonRole is the role Person has in the organization, with the name in
	// PersonRoles, e.g. daglig-leder or styreleder.
	PersonRole string `json:"personRole"`
	// Person is the person with PersonRole in Register. Without a chosen
	// person role it is the leader (see leader). For underenheter the person
	// is from the hovedenhet.
	Person register.Party `json:"person"`
	// Hovedenhet is the hovedenhet in Register when the organization is an
	// underenhet (BEDR or AAFY).
	Hovedenhet *register.Party `json:"hovedenhet,omitempty"`
}

// organizationCandidate is an organization from Tenor that has not been
// looked up in Register yet.
type organizationCandidate struct {
	organizationIdentifier string
	// person is the fødselsnummer of the person with personRole. For
	// underenheter it is empty until the hovedenhet has been fetched.
	person     string
	personRole string
	// hovedenhet is the organization number of the hovedenhet when the
	// organization is an underenhet.
	hovedenhet string
	role       string
	kildedata  json.RawMessage
}

// OrganizationQuery is which organizations FindOrganizations fetches. Only
// one of UnitTypes, OrganizationNumbers and Role can be used.
type OrganizationQuery struct {
	// Count is how many organizations are fetched. With OrganizationNumbers
	// it is the number of organization numbers.
	Count int
	// UnitTypes are the unit types in UnitTypes, e.g. AS or ENK. Empty gives
	// DefaultUnitType.
	UnitTypes []string
	// Subunits fetches underenheter (BEDR and AAFY) of organizations with the
	// unit types in UnitTypes, instead of the organizations themselves.
	Subunits bool
	// MinSubunits fetches only organizations with at least this many
	// underenheter, or with Subunits underenheter of such organizations. 0
	// means no requirement, but with Subunits the hovedenhet must have at
	// least one.
	MinSubunits int
	// OrganizationNumbers are the organizations to fetch.
	OrganizationNumbers []string
	// Role is the name of a role in Roles. Then tilretteleggere with that
	// role are fetched.
	Role string
	// PersonRole is the name of a role in PersonRoles. Then only
	// organizations where a person has the role are fetched, and Person is
	// that person. Empty gives the leader.
	PersonRole string
	// Env is the environment in Register.
	Env string
}

// FindOrganizations fetches q.Count organizations with a person with the role
// q.PersonRole, or with a leader, where both the organization and the person
// exist in Register for q.Env. For underenheter the person is from the
// hovedenhet, which must also exist in Register. Others are replaced with new
// ones from Tenor, in up to maxRegisterRounds rounds, and how many were
// replaced is written to log. All the parties in a round are looked up in the
// same call.
func FindOrganizations(ctx context.Context, c *tenor.Client, reg *register.Client, q OrganizationQuery, log io.Writer) ([]Organization, error) {
	if len(q.OrganizationNumbers) > 0 {
		q.Count = len(q.OrganizationNumbers)
	}
	var personRole PersonRole
	if q.PersonRole != "" {
		var err error
		if personRole, err = FindPersonRole(q.PersonRole); err != nil {
			return nil, err
		}
	}

	seen := map[string]bool{}
	organizations := make([]Organization, 0, q.Count)
	notInRegister := 0
	for round := 0; round < maxRegisterRounds && len(organizations) < q.Count; round++ {
		candidates, err := fetchForQuery(ctx, c, q, personRole, q.Count-len(organizations))
		if err != nil {
			return nil, err
		}
		var unseen []organizationCandidate
		for _, k := range candidates {
			if !seen[k.organizationIdentifier] {
				seen[k.organizationIdentifier] = true
				unseen = append(unseen, k)
			}
		}
		if len(unseen) == 0 {
			break
		}

		ids := make([]string, 0, 3*len(unseen))
		for _, k := range unseen {
			ids = append(ids, k.organizationIdentifier, k.person)
			if k.hovedenhet != "" {
				ids = append(ids, k.hovedenhet)
			}
		}
		partyByID, err := reg.LookupIdentifiers(ctx, ids, registerFields...)
		if err != nil {
			return nil, err
		}

		for _, k := range unseen {
			party, found := partyByID[k.organizationIdentifier]
			person, personFound := partyByID[k.person]
			var hovedenhet *register.Party
			if k.hovedenhet != "" {
				if h, ok := partyByID[k.hovedenhet]; ok {
					hovedenhet = &h
				} else {
					found = false
				}
			}
			if !found || !personFound {
				notInRegister++
				continue
			}
			organizations = append(organizations, Organization{
				Role:       k.role,
				Kildedata:  k.kildedata,
				Party:      party,
				PersonRole: k.personRole,
				Person:     person,
				Hovedenhet: hovedenhet,
			})
			if len(organizations) == q.Count {
				break
			}
		}
	}
	if notInRegister > 0 {
		fmt.Fprintf(log, "Register (%s): %d organizations from Tenor, or their person or hovedenhet, do not exist and were replaced.\n", q.Env, notInRegister)
	}
	return organizations, nil
}

// fetchForQuery fetches count organizations from Tenor according to q: given
// organizations, tilretteleggere with the role, or organizations with the
// unit types. Only organizations with a person with personRole, or with a
// leader when it is empty, are kept. Nothing has been looked up in Register
// yet.
func fetchForQuery(ctx context.Context, c *tenor.Client, q OrganizationQuery, personRole PersonRole, count int) ([]organizationCandidate, error) {
	switch {
	case len(q.OrganizationNumbers) > 0:
		candidates, err := fetchGivenOrganizations(ctx, c, q.OrganizationNumbers, personRole)
		if err != nil {
			return nil, err
		}
		return withHovedenheter(ctx, c, candidates, personRole)
	case q.Role != "":
		role, err := FindRole(q.Role)
		if err != nil {
			return nil, err
		}
		return fetchTilretteleggere(ctx, c, role, personRole, count)
	case q.Subunits:
		return fetchUnderenheter(ctx, c, q.KQL(), personRole, count)
	default:
		candidates, err := fetchOrganizations(ctx, c, q.KQL(), personRole, count)
		if err != nil {
			return nil, err
		}
		// Does nothing when there are no underenheter among the candidates.
		return withHovedenheter(ctx, c, candidates, personRole)
	}
}

// KQL is the search for the organizations with the unit types in
// q.UnitTypes, or for the hovedenheter when q.Subunits is set. With
// q.MinSubunits, or q.Subunits, they must have at least that many
// underenheter.
func (q OrganizationQuery) KQL() string {
	if !q.Subunits && q.MinSubunits <= 0 {
		return OrganizationKQL(q.UnitTypes)
	}
	atLeast := strconv.Itoa(max(1, q.MinSubunits))
	return tenor.And(OrganizationKQL(q.UnitTypes), tenor.Compare("antallUnderenheter", tenor.GreaterOrEqual, atLeast))
}

// underenheterPerSearch is how many hovedenheter the underenheter are fetched
// for in one search with erUnderenhet.hovedenhet:(a or b ...). A hovedenhet
// can have many underenheter, and a search gives at most tenor.MaxPerPage.
const underenheterPerSearch = 20

// fetchUnderenheter fetches count underenheter (BEDR and AAFY), one per
// hovedenhet. The hovedenheter match kql, which must require underenheter,
// and have a person with personRole, or a leader, whom the underenhet gets.
func fetchUnderenheter(ctx context.Context, c *tenor.Client, kql string, personRole PersonRole, count int) ([]organizationCandidate, error) {
	hovedenheter, err := fetchOrganizations(ctx, c, kql, personRole, count)
	if err != nil {
		return nil, err
	}
	organizationNumbers := make([]string, len(hovedenheter))
	for i, h := range hovedenheter {
		organizationNumbers[i] = h.organizationIdentifier
	}
	underenheter, err := fetchFirstUnderenhet(ctx, c, organizationNumbers)
	if err != nil {
		return nil, err
	}

	candidates := make([]organizationCandidate, 0, len(hovedenheter))
	for _, h := range hovedenheter {
		u, ok := underenheter[h.organizationIdentifier]
		if !ok {
			continue
		}
		u.person, u.personRole = h.person, h.personRole
		candidates = append(candidates, u)
	}
	return candidates, nil
}

// fetchFirstUnderenhet fetches the first underenhet Tenor gives for each of
// the hovedenheter, many at a time. Hovedenheter that got no underenhet are
// not in the result.
func fetchFirstUnderenhet(ctx context.Context, c *tenor.Client, hovedenheter []string) (map[string]organizationCandidate, error) {
	underenheter := make(map[string]organizationCandidate, len(hovedenheter))
	for start := 0; start < len(hovedenheter); start += underenheterPerSearch {
		batch := hovedenheter[start:min(start+underenheterPerSearch, len(hovedenheter))]
		res, err := c.Search(ctx, tenor.SourceBrreg, tenor.SearchParams{
			KQL:    "erUnderenhet.hovedenhet:(" + strings.Join(batch, " or ") + ")",
			Antall: tenor.Ptr[int32](tenor.MaxPerPage),
			Vis:    []string{"tenorMetadata"},
		})
		if err != nil {
			return nil, err
		}
		for _, d := range res.DokumentListe {
			md, err := tenor.ReadMetadata(d)
			if err != nil {
				continue
			}
			u, ok := toOrganizationCandidate(md, PersonRole{})
			if _, exists := underenheter[u.hovedenhet]; ok && u.hovedenhet != "" && !exists {
				underenheter[u.hovedenhet] = u
			}
		}
	}
	return underenheter, nil
}

// withHovedenheter fetches the hovedenheter of the underenheter among the
// candidates, many at a time, and gives the underenheter the person with
// personRole, or the leader, from the hovedenhet. Underenheter whose
// hovedenhet does not exist in Tenor or lacks the person are dropped. Other
// candidates are unchanged.
func withHovedenheter(ctx context.Context, c *tenor.Client, candidates []organizationCandidate, personRole PersonRole) ([]organizationCandidate, error) {
	var organizationNumbers []string
	for _, k := range candidates {
		if k.hovedenhet != "" && !slices.Contains(organizationNumbers, k.hovedenhet) {
			organizationNumbers = append(organizationNumbers, k.hovedenhet)
		}
	}
	if len(organizationNumbers) == 0 {
		return candidates, nil
	}
	documents, err := fetchByOrganizationNumber(ctx, c, organizationNumbers)
	if err != nil {
		return nil, err
	}
	kept := make([]organizationCandidate, 0, len(candidates))
	for _, k := range candidates {
		if k.hovedenhet != "" {
			md, ok := documents[k.hovedenhet]
			if !ok {
				continue
			}
			h, ok := toOrganizationCandidate(md, personRole)
			if !ok || h.person == "" {
				continue
			}
			k.person, k.personRole = h.person, h.personRole
		}
		kept = append(kept, k)
	}
	return kept, nil
}

// OrganizationKQL gives KQL for organizations with the unit types. Empty
// gives DefaultUnitType.
func OrganizationKQL(unitTypes []string) string {
	codes := make([]string, len(unitTypes))
	for i, t := range unitTypes {
		codes[i] = strings.ToUpper(t)
	}
	switch len(codes) {
	case 0:
		return tenor.Eq("organisasjonsform.kode", DefaultUnitType)
	case 1:
		return tenor.Eq("organisasjonsform.kode", codes[0])
	default:
		return tenor.OneOf("organisasjonsform.kode", codes...)
	}
}

var organizationNumberRe = regexp.MustCompile(`^\d{9}$`)

// rollegruppe is a group in rollegrupper in a brreg document, e.g. DAGL or
// STYR.
type rollegruppe struct {
	Type struct {
		Kode string `json:"kode"`
	} `json:"type"`
	Roller []struct {
		// Type is the role, e.g. DAGL, or LEDE and MEDL in STYR.
		Type struct {
			Kode string `json:"kode"`
		} `json:"type"`
		Person struct {
			Foedselsnummer string `json:"foedselsnummer"`
		} `json:"person"`
		// Virksomhet is set when the role is held by an organization, e.g. a
		// revisor.
		Virksomhet struct {
			Organisasjonsnummer string `json:"organisasjonsnummer"`
		} `json:"virksomhet"`
		// Fratraadt is "J" or "N".
		Fratraadt string `json:"fratraadt"`
	} `json:"roller"`
}

// leader returns the fødselsnummer of the daglig leder (DAGL), or of the
// innehaver (INNH) if there is no daglig leder, and the code for the role.
// Borettslag and eierseksjonssameier rarely have a daglig leder, so for them
// it is the styreleder (LEDE) when there is no daglig leder.
func leader(unitType string, groups []rollegruppe) (personIdentifier, code string) {
	codes := []string{"DAGL", "INNH"}
	if slices.Contains(styrelederUnitTypes, unitType) {
		codes = []string{"DAGL", "LEDE"}
	}
	for _, code := range codes {
		if personIdentifier := personWithRole(groups, code); personIdentifier != "" {
			return personIdentifier, code
		}
	}
	return "", ""
}

// personWithRole returns the fødselsnummer of the first person with the role
// code, e.g. DAGL or MEDL. Resigned roles and roles without a fødselsnummer
// are skipped.
func personWithRole(groups []rollegruppe, code string) string {
	for _, g := range groups {
		for _, r := range g.Roller {
			if r.Type.Kode == code && r.Fratraadt != "J" && personIdentifierRe.MatchString(r.Person.Foedselsnummer) {
				return r.Person.Foedselsnummer
			}
		}
	}
	return ""
}

// organizationWithRole returns the organization number of the first
// organization with the role code, e.g. BEDR.
func organizationWithRole(groups []rollegruppe, code string) string {
	for _, g := range groups {
		for _, r := range g.Roller {
			if r.Type.Kode == code && r.Fratraadt != "J" && organizationNumberRe.MatchString(r.Virksomhet.Organisasjonsnummer) {
				return r.Virksomhet.Organisasjonsnummer
			}
		}
	}
	return ""
}

// hasPersonOrHovedenhet reports whether the candidate has the person, or is
// an underenhet that can get it from the hovedenhet.
func (k organizationCandidate) hasPersonOrHovedenhet() bool {
	return k.person != "" || k.hovedenhet != ""
}

// fetchOrganizations fetches count unique candidates from brreg-er-fr that
// match kql and have a person with personRole, or a leader when it is empty.
// Underenheter are included when they have a hovedenhet, and must get the
// person with withHovedenheter.
func fetchOrganizations(ctx context.Context, c *tenor.Client, kql string, personRole PersonRole, count int) ([]organizationCandidate, error) {
	// Not all the roles in PersonRoles have a search field in Tenor (e.g.
	// prokurist), so the person requirement is checked here.
	hasPerson := func(md tenor.Metadata) bool {
		k, ok := toOrganizationCandidate(md, personRole)
		return ok && k.hasPersonOrHovedenhet()
	}
	documents, err := c.FetchManyFiltered(ctx, tenor.SourceBrreg, kql, count, hasPerson)
	if err != nil {
		return nil, err
	}
	candidates := make([]organizationCandidate, 0, len(documents))
	for _, md := range documents {
		if k, ok := toOrganizationCandidate(md, personRole); ok {
			candidates = append(candidates, k)
		}
	}
	return candidates, nil
}

// fetchGivenOrganizations fetches the organizations with the organization
// numbers, in the same order. Those that do not exist in Tenor or lack the
// person are skipped. Underenheter must get the person with withHovedenheter.
func fetchGivenOrganizations(ctx context.Context, c *tenor.Client, organizationNumbers []string, personRole PersonRole) ([]organizationCandidate, error) {
	documents, err := fetchByOrganizationNumber(ctx, c, organizationNumbers)
	if err != nil {
		return nil, err
	}
	candidates := make([]organizationCandidate, 0, len(organizationNumbers))
	for _, organizationNumber := range organizationNumbers {
		md, ok := documents[organizationNumber]
		if !ok {
			continue
		}
		if k, ok := toOrganizationCandidate(md, personRole); ok && k.hasPersonOrHovedenhet() {
			candidates = append(candidates, k)
		}
	}
	return candidates, nil
}

// toOrganizationCandidate turns a brreg document into a candidate, with the
// person with personRole, or the leader when it is empty. For underenheter it
// is the hovedenhet, from the role BEDR or AAFY, or from
// underenhet.hovedenhet if the role is missing. Documents without a valid
// organization number are skipped.
func toOrganizationCandidate(md tenor.Metadata, personRole PersonRole) (organizationCandidate, bool) {
	var kildedata struct {
		Organisasjonsnummer string `json:"organisasjonsnummer"`
		Organisasjonsform   struct {
			Kode string `json:"kode"`
		} `json:"organisasjonsform"`
		Underenhet struct {
			Hovedenhet string `json:"hovedenhet"`
		} `json:"underenhet"`
		Rollegrupper []rollegruppe `json:"rollegrupper"`
	}
	validJSON := json.Unmarshal([]byte(md.Kildedata), &kildedata) == nil

	organizationNumber := md.ID
	if !organizationNumberRe.MatchString(organizationNumber) {
		organizationNumber = kildedata.Organisasjonsnummer
	}
	if !organizationNumberRe.MatchString(organizationNumber) {
		return organizationCandidate{}, false
	}

	unitType := kildedata.Organisasjonsform.Kode
	k := organizationCandidate{organizationIdentifier: organizationNumber}
	if slices.Contains(underenhetUnitTypes, unitType) {
		k.hovedenhet = organizationWithRole(kildedata.Rollegrupper, unitType)
		if k.hovedenhet == "" && organizationNumberRe.MatchString(kildedata.Underenhet.Hovedenhet) {
			k.hovedenhet = kildedata.Underenhet.Hovedenhet
		}
	} else if personRole.Code != "" {
		k.person = personWithRole(kildedata.Rollegrupper, personRole.Code)
		k.personRole = personRole.Name
	} else if personIdentifier, code := leader(kildedata.Organisasjonsform.Kode, kildedata.Rollegrupper); personIdentifier != "" {
		k.person, k.personRole = personIdentifier, personRoleByCode(code).Name
	}
	if validJSON {
		k.kildedata = json.RawMessage(md.Kildedata)
	}
	return k, true
}
