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
// roles Access Management imports from Enhetsregisteret and that persons have
// in Tenor.
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
	{Name: "forretningsforer", Code: "FFØR"},
	{Name: "prokurist", Code: "PROK"},
	{Name: "prokurist-fellesskap", Code: "POFE"},
	{Name: "prokurist-hver-for-seg", Code: "POHV"},
	{Name: "signerer", Code: "SIGN"},
	{Name: "signerer-fellesskap", Code: "SIFE"},
	{Name: "signerer-hver-for-seg", Code: "SIHV"},
	{Name: "stifter", Code: "STFT"},
	// The spelling is Access Management's.
	{Name: "elektronisk-signeringsrettig", Code: "ESGR"},
	{Name: "elektronisk-signeringsrett-tildeler", Code: "ETDL"},
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

// personRoleByCode looks up the person role with the code from Tenor.
func personRoleByCode(code string) PersonRole {
	i := slices.IndexFunc(PersonRoles, func(r PersonRole) bool { return r.Code == code })
	return PersonRoles[i]
}
