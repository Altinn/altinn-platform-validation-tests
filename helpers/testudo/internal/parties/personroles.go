package parties

import (
	"fmt"
	"slices"
	"strings"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// PersonRole is a role a person can have in an organization in
// Enhetsregisteret, and that Access Management imports.
type PersonRole struct {
	// Name is the role code in Access Management and Register, e.g.
	// styreleder.
	Name string
	// Code is the role code in the brreg document from Tenor, e.g. LEDE.
	Code string
}

// PersonRoles are the person roles FindOrganizations can fetch. They are the
// roles from Enhetsregisteret that Access Management has assigned to persons
// (provider sys-ccr), with Access Management's names, and that persons have
// in Tenor.
//
// Left out are the roles only organizations have in Tenor, such as revisor,
// revisoradressat, regnskapsforeradressat, konkursdebitor and
// personlige-konkurs, and the roles Access Management has that Tenor does
// not: sameier, kontaktperson-ados, kontaktperson-nuf, kontaktperson-kommune
// and kontaktperson-revisor. Access Management seems to derive the last
// four from kontaktperson, which Tenor has.
var PersonRoles = []PersonRole{
	{Name: "daglig-leder", Code: "DAGL"},
	{Name: "innehaver", Code: "INNH"},
	{Name: "styreleder", Code: "LEDE"},
	{Name: "nestleder", Code: "NEST"},
	{Name: "styremedlem", Code: "MEDL"},
	{Name: "varamedlem", Code: "VARA"},
	{Name: "observator", Code: "OBS"},
	{Name: "kontaktperson", Code: "KONT"},
	{Name: "norsk-representant", Code: "REPR"},
	{Name: "deltaker-delt-ansvar", Code: "DTPR"},
	{Name: "deltaker-fullt-ansvar", Code: "DTSO"},
	{Name: "komplementar", Code: "KOMP"},
	{Name: "bestyrende-reder", Code: "BEST"},
	{Name: "forretningsforer", Code: "FFØR"},
	{Name: "prokurist", Code: "PROK"},
	{Name: "prokurist-fellesskap", Code: "POFE"},
	{Name: "prokurist-hver-for-seg", Code: "POHV"},
	{Name: "signerer", Code: "SIGN"},
	{Name: "signerer-fellesskap", Code: "SIFE"},
	{Name: "signerer-hver-for-seg", Code: "SIHV"},
	{Name: "bostyrer", Code: "BOBE"},
	// The spelling is Access Management's.
	{Name: "kontorfelleskapmedlem", Code: "KTRF"},
}

// PersonRoleNames are the names in PersonRoles, for help texts and error
// messages.
func PersonRoleNames() string {
	names := make([]string, len(PersonRoles))
	for i, r := range PersonRoles {
		names[i] = r.Name
	}
	return strings.Join(names, ", ")
}

// FindPersonRole looks up the person role with the name.
func FindPersonRole(name string) (PersonRole, error) {
	i := slices.IndexFunc(PersonRoles, func(r PersonRole) bool { return r.Name == name })
	if i < 0 {
		return PersonRole{}, fmt.Errorf("%w: unknown person role %q, use one of %s", errs.Invalid, name, PersonRoleNames())
	}
	return PersonRoles[i], nil
}

// joinPersonRoles gives the names of the roles, comma-separated, e.g.
// daglig-leder,styreleder.
func joinPersonRoles(roles []PersonRole) string {
	names := make([]string, len(roles))
	for i, r := range roles {
		names[i] = r.Name
	}
	return strings.Join(names, ",")
}

// personRoleCodes gives the codes of the roles, e.g. DAGL and LEDE.
func personRoleCodes(roles []PersonRole) []string {
	codes := make([]string, len(roles))
	for i, r := range roles {
		codes[i] = r.Code
	}
	return codes
}

// personRoleByCode looks up the person role with the code from Tenor.
func personRoleByCode(code string) PersonRole {
	i := slices.IndexFunc(PersonRoles, func(r PersonRole) bool { return r.Code == code })
	return PersonRoles[i]
}
