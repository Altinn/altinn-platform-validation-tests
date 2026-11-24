package tenor

// Helpers for building KQL queries for Tenor. Field names and values for freg
// are taken from Tenor's "Avansert søk" documentation for Folkeregisteret.

import (
	"fmt"
	"strings"
	"time"
)

// KQLDateFormat is the date format Tenor uses in KQL, e.g. foedselsdato>1970-01-01.
const KQLDateFormat = "2006-01-02"

// Comparison is an operator for number and date fields.
type Comparison string

const (
	Greater        Comparison = ">"
	GreaterOrEqual Comparison = ">="
	Less           Comparison = "<"
	LessOrEqual    Comparison = "<="
)

// Eq gives field:"value". The value is quoted, so spaces and special
// characters are safe.
func Eq(field, value string) string {
	return field + ":" + quote(value)
}

// OneOf gives field:("a" or "b" ...).
func OneOf(field string, values ...string) string {
	quoted := make([]string, len(values))
	for i, v := range values {
		quoted[i] = quote(v)
	}
	return field + ":(" + strings.Join(quoted, " or ") + ")"
}

// Exists gives field:*, which matches all documents that have the field,
// whatever the value.
func Exists(field string) string {
	return field + ":*"
}

// Bool gives field:true or field:false for boolean fields.
func Bool(field string, value bool) string {
	return fmt.Sprintf("%s:%t", field, value)
}

// Compare gives e.g. navnLengde>50 or foedselsdato>=1970-01-01.
func Compare(field string, op Comparison, value string) string {
	return field + string(op) + value
}

// Range gives field:[from to to]. An empty bound becomes *, i.e. open.
func Range(field, from, to string) string {
	if from == "" {
		from = "*"
	}
	if to == "" {
		to = "*"
	}
	return fmt.Sprintf("%s:[%s to %s]", field, from, to)
}

// DateRange is Range with dates. A zero time becomes an open bound.
func DateRange(field string, from, to time.Time) string {
	return Range(field, formatDate(from), formatDate(to))
}

// Nested searches in a nested object, e.g.
// Nested("tenorRelasjoner.arbeidsforhold", Eq("ansettelsesform", "fast")).
func Nested(field, inner string) string {
	return field + ":{" + inner + "}"
}

// And joins subexpressions with AND. Empty parts are skipped.
func And(parts ...string) string {
	return combine(" AND ", parts)
}

// Or joins subexpressions with OR. Empty parts are skipped.
func Or(parts ...string) string {
	return combine(" OR ", parts)
}

// Not negates an expression.
func Not(expr string) string {
	return "NOT (" + expr + ")"
}

func combine(sep string, parts []string) string {
	nonEmpty := make([]string, 0, len(parts))
	for _, d := range parts {
		if d = strings.TrimSpace(d); d != "" {
			nonEmpty = append(nonEmpty, d)
		}
	}
	if len(nonEmpty) == 1 {
		return nonEmpty[0]
	}
	for i, d := range nonEmpty {
		nonEmpty[i] = "(" + d + ")"
	}
	return strings.Join(nonEmpty, sep)
}

func quote(v string) string {
	v = strings.ReplaceAll(v, `\`, `\\`)
	v = strings.ReplaceAll(v, `"`, `\"`)
	return `"` + v + `"`
}

func formatDate(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.Format(KQLDateFormat)
}

// Field names in freg (Folkeregisteret).
const (
	// Address
	FregAdresseBeskyttelse                 = "adresseBeskyttelse"
	FregAdresseGradering                   = "adresseGradering"
	FregBorMedFar                          = "borMedFar"
	FregBorMedMor                          = "borMedMor"
	FregBorMedMedmor                       = "borMedMedmor"
	FregBostedsadresse                     = "bostedsadresse"
	FregBostedsadresseType                 = "bostedsadresseType"
	FregCoAdressenavnType                  = "coAdressenavnType"
	FregDeltBosted                         = "deltBosted"
	FregForeldreHarSammeAdresse            = "foreldreHarSammeAdresse"
	FregHarBostedsadresseHistorikk         = "harBostedsadresseHistorikk"
	FregHarPostadresseIFrittFormat         = "harPostadresseIFrittFormat"
	FregHarPostboks                        = "harPostboks"
	FregHarPostadressePostboks             = "harPostadressePostboks"
	FregHarPostadresseVegadresse           = "harPostadresseVegadresse"
	FregKommunenr                          = "kommunenr"
	FregOppholdAnnetSted                   = "oppholdAnnetSted"
	FregOppholdsadresseType                = "oppholdsadresseType"
	FregPostadresse                        = "postadresse"
	FregPostadresseUtland                  = "postadresseUtland"
	FregHarUtenlandskPostadressePostboks   = "harUtenlandskPostadressePostboks"
	FregHarUtenlandskPostadresseVegadresse = "harUtenlandskPostadresseVegadresse"
	FregHarUtenlandskAdresseIFrittFormat   = "harUtenlandskAdresseIFrittFormat"
	FregUkjentBosted                       = "ukjentBosted"
	FregAdresseSpesialtegn                 = "adresseSpesialtegn"
	FregSisteBoKommune                     = "sisteBoKommune"

	// Name
	FregEtternavn        = "etternavn"
	FregFlereFornavn     = "flereFornavn"
	FregFornavn          = "fornavn"
	FregHarNavnHistorikk = "harNavnHistorikk"
	FregMellomnavn       = "mellomnavn"
	FregNavnLengde       = "navnLengde"
	FregVisningnavn      = "visningnavn"
	FregNavnSpesialtegn  = "navnSpesialtegn"

	// Immigration and emigration
	FregHarInnflytting = "harInnflytting"
	FregHarUtflytting  = "harUtflytting"

	// Marital status
	FregHarSivilstandHistorikk = "harSivilstandHistorikk"
	FregSivilstand             = "sivilstand"

	// Date of birth, identification and status
	FregHarAvvikFdato                  = "harAvvikFdato"
	FregFoedselsdato                   = "foedselsdato"
	FregID                             = "id"
	FregIdentifikator                  = "identifikator"
	FregIdentifikatorType              = "identifikatorType"
	FregIdentitetsgrunnlagStatus       = "identitetsgrunnlagStatus"
	FregLegitimasjonsdokument          = "legitimasjonsdokument"
	FregUtenlandskPersonidentifikasjon = "utenlandskPersonidentifikasjon"
	FregPersonstatus                   = "personstatus"

	// Death
	FregDoedsdato          = "doedsdato"
	FregKontaktinfoDoedsbo = "kontaktinfoDoedsbo"

	// Family relations
	FregAntallBarn                                      = "antallBarn"
	FregForeldreansvar                                  = "foreldreansvar"
	FregHarDoedfoedtBarn                                = "harDoedfoedtBarn"
	FregHarForeldreMedSammeKjoenn                       = "harForeldreMedSammeKjoenn"
	FregBarnFnr                                         = "barnFnr"
	FregFarFnr                                          = "farFnr"
	FregMedmorFnr                                       = "medmorFnr"
	FregMorFnr                                          = "morFnr"
	FregPartnerFnr                                      = "partnerFnr"
	FregMinRolleForPerson                               = "minRolleForPerson"
	FregRelatertPersonsRolle                            = "relatertPersonsRolle"
	FregHarRelatertPersonUtenFolkeregisteridentifikator = "harRelatertPersonUtenFolkeregisteridentifikator"

	// Miscellaneous
	FregFalskIdentitet         = "falskIdentitet"
	FregFoedeland              = "foedeland"
	FregHarOpphold             = "harOpphold"
	FregOppholdstillatelseType = "oppholdstillatelseType"
	FregKjoenn                 = "kjoenn"

	// Citizenship
	FregNorskStatsborgerskap        = "norskStatsborgerskap"
	FregStatsborgerskap             = "statsborgerskap"
	FregFlereStatsborgerskap        = "flereStatsborgerskap"
	FregNordenStatsborgerskap       = "nordenStatsborgerskap"
	FregEuEoesStatsborgerskap       = "euEoesStatsborgerskap"
	FregTredjelandStatsborgerskap   = "tredjelandStatsborgerskap"
	FregUtgaattStatsborgerskap      = "utgaattStatsborgerskap"
	FregHarStatsborgerskapHistorikk = "harStatsborgerskapHistorikk"

	// Guardianship and legal capacity
	FregVergemaalType           = "vergemaalType"
	FregVergeTjenestevirksomhet = "vergeTjenestevirksomhet"
	FregVergeTjenesteoppgave    = "vergeTjenesteoppgave"
	FregHarRettsligHandleevne   = "harRettsligHandleevne"

	// Tenor data, relations and events
	FregTenorOpprettet  = "tenorMetadata.opprettet"
	FregTenorOppdatert  = "tenorMetadata.oppdatert"
	FregTenorRelasjoner = "tenorRelasjoner"
	FregHendelser       = "hendelser"
	FregSisteHendelse   = "sisteHendelse"
)

// Values for freg fields. Only the values the documentation mentions are
// included; the fields can have more.
const (
	PersonstatusBosatt = "bosatt"

	AdresseBeskyttelseFortrolig        = "fortrolig"
	AdresseBeskyttelseStrengtFortrolig = "strengtFortrolig"

	AdresseGraderingUgradert      = "ugradert"
	AdresseGraderingFortrolig     = "fortrolig"
	AdresseGraderingKlientadresse = "klientadresse"

	AdresseTypeMatrikkel  = "matrikkel"
	AdresseTypeVeiadresse = "veiadresse"
	AdresseTypeUkjent     = "ukjent"

	CoAdressenavnBostedsadresse       = "bostedsadresse"
	CoAdressenavnDeltBosted           = "deltBosted"
	CoAdressenavnOppholdsadresse      = "oppholdsadresse"
	CoAdressenavnPostadresse          = "postadresse"
	CoAdressenavnPostadresseIUtlandet = "postadresseIUtlandet"

	OppholdAnnetStedMilitaer    = "militaer"
	OppholdAnnetStedPendler     = "pendler"
	OppholdAnnetStedUtenriks    = "utenriks"
	OppholdAnnetStedPaaSvalbard = "paaSvalbard"

	SivilstandEnkeEllerEnkemann  = "enkeEllerEnkemann"
	SivilstandGift               = "gift"
	SivilstandGjenlevendePartner = "gjenlevendePartner"
	SivilstandRegistrertPartner  = "registrertPartner"
	SivilstandSeparert           = "separert"
	SivilstandSeparertPartner    = "separertPartner"
	SivilstandSkilt              = "skilt"
	SivilstandSkiltPartner       = "skiltPartner"
	SivilstandUgift              = "ugift"
	SivilstandUoppgitt           = "uoppgitt"

	IdentifikatorTypeDNummer             = "dNummer"
	IdentifikatorTypeDNummerOgFoedselsnr = "dNummerOgFoedselsnr"
	IdentifikatorTypeFoedselsnummer      = "foedselsnummer"

	IdentitetsgrunnlagIkkeKontrollert = "ikkeKontrollert"
	IdentitetsgrunnlagIngenStatus     = "ingenStatus"
	IdentitetsgrunnlagKontrollert     = "kontrollert"

	KontaktinfoDoedsboAdvokat      = "advokat"
	KontaktinfoDoedsboOrganisasjon = "organisasjon"
	KontaktinfoDoedsboPerson       = "person"

	ForeldreansvarMor    = "mor"
	ForeldreansvarFar    = "far"
	ForeldreansvarFelles = "felles"
	ForeldreansvarAndre  = "andre"
	ForeldreansvarUkjent = "ukjent"
	ForeldreansvarMedmor = "medmor"

	RolleBarn                  = "barn"
	RolleMor                   = "mor"
	RolleFar                   = "far"
	RolleMedmor                = "medmor"
	RolleEktefelleEllerPartner = "ektefelleEllerPartner"
	RolleDoedfoedtBarn         = "doedfoedtBarn"

	OppholdstillatelseMidlertidig       = "midlertidig"
	OppholdstillatelsePermanent         = "permanent"
	OppholdstillatelseOpplysningMangler = "opplysningMangler"

	KjoennMann   = "mann"
	KjoennKvinne = "kvinne"
)
