package parties

import (
	"fmt"
	"slices"
	"strings"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// PersonRole er en rolle en person kan ha i en virksomhet i
// Enhetsregisteret, og som Access Management importerer.
type PersonRole struct {
	// Name er rollekoden i Access Management og Register, f.eks. styreleder.
	Name string
	// Code er rollekoden i brreg-dokumentet fra Tenor, f.eks. LEDE.
	Code string
}

// PersonRoles er personrollene FindOrganizations kan hente. Det er rollene
// Access Management importerer fra Enhetsregisteret og som personer har i
// Tenor.
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
	// Skrivemåten er Access Management sin.
	{Name: "elektronisk-signeringsrettig", Code: "ESGR"},
	{Name: "elektronisk-signeringsrett-tildeler", Code: "ETDL"},
}

// PersonRoleNames er navnene i PersonRoles, til hjelpetekst og feilmeldinger.
func PersonRoleNames() string {
	navn := make([]string, len(PersonRoles))
	for i, r := range PersonRoles {
		navn[i] = r.Name
	}
	return strings.Join(navn, ", ")
}

// FindPersonRole slår opp personrollen med navnet.
func FindPersonRole(name string) (PersonRole, error) {
	i := slices.IndexFunc(PersonRoles, func(r PersonRole) bool { return r.Name == name })
	if i < 0 {
		return PersonRole{}, fmt.Errorf("%w: ukjent personrolle %q, bruk en av %s", errs.Invalid, name, PersonRoleNames())
	}
	return PersonRoles[i], nil
}

// personRoleByCode slår opp personrollen med koden fra Tenor.
func personRoleByCode(code string) PersonRole {
	i := slices.IndexFunc(PersonRoles, func(r PersonRole) bool { return r.Code == code })
	return PersonRoles[i]
}
