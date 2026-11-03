package parties

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"regexp"
	"slices"
	"strings"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

// UnitTypes er organisasjonsformene FindOrganizations kan hente, med kodene
// fra Enhetsregisteret: aksjeselskap, enkeltpersonforetak,
// eierseksjonssameie, borettslag og norskregistrert utenlandsk foretak.
var UnitTypes = []string{"AS", "ENK", "ESEK", "BRL", "NUF"}

// DefaultUnitType er organisasjonsformen som hentes når ingen er valgt.
const DefaultUnitType = "AS"

// styreledetUnitTypes er organisasjonsformene som sjelden har daglig leder,
// og der styreleder er lederen.
var styreledetUnitTypes = []string{"ESEK", "BRL"}

// FindUnitType slår opp organisasjonsformen i UnitTypes, uansett store eller
// små bokstaver.
func FindUnitType(name string) (string, error) {
	kode := strings.ToUpper(name)
	if !slices.Contains(UnitTypes, kode) {
		return "", fmt.Errorf("%w: ukjent organisasjonsform %q, bruk en av %s", errs.Invalid, name, strings.Join(UnitTypes, ", "))
	}
	return kode, nil
}

// ValidOrganizationNumber er om s ser ut som et organisasjonsnummer (9
// siffer).
func ValidOrganizationNumber(s string) bool {
	return organisasjonsnummerRe.MatchString(s)
}

// Organization er en virksomhet fra brreg-er-fr der både virksomheten og
// lederen finnes i Register for miljøet. Alt om dem er fra Register. Fra
// Tenor er bare Kildedata, og hvem som er leder.
type Organization struct {
	// Rolle er tilretteleggerrollen når virksomheten er hentet med en rolle.
	Rolle string `json:"rolle,omitempty"`
	// Kildedata er hele brreg-dokumentet fra Tenor.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
	// Party er virksomheten i Register. I JSON ligger feltene på samme nivå
	// som rolle og kildedata.
	register.Party
	// LederParty er lederen i Register: daglig leder, innehaver for
	// enkeltpersonforetak, eller styreleder for borettslag og
	// eierseksjonssameier uten daglig leder.
	LederParty register.Party `json:"lederParty"`
}

// virksomhetKandidat er en virksomhet fra Tenor som ikke er slått opp i
// Register ennå.
type virksomhetKandidat struct {
	organisasjonsnummer string
	// leder er fødselsnummeret til lederen, se leder.
	leder     string
	rolle     string
	kildedata json.RawMessage
}

// OrganizationQuery er hvilke virksomheter FindOrganizations henter. Bare ett
// av UnitTypes, OrganizationNumbers og Role kan brukes.
type OrganizationQuery struct {
	// Count er hvor mange virksomheter som hentes. Med OrganizationNumbers er
	// det antallet organisasjonsnumre.
	Count int
	// UnitTypes er organisasjonsformene i UnitTypes, f.eks. AS eller ENK. Tom
	// gir DefaultUnitType.
	UnitTypes []string
	// OrganizationNumbers er virksomhetene som hentes.
	OrganizationNumbers []string
	// Role er navnet på en rolle i Roles. Da hentes tilretteleggere med den
	// rollen.
	Role string
	// Env er miljøet i Register.
	Env string
}

// FindOrganizations henter q.Count virksomheter med leder (se leder) der både
// virksomheten og lederen finnes i Register for q.Env. Andre byttes ut med
// nye fra Tenor, i opptil maksRegisterRunder runder, og hvor mange som ble
// byttet ut skrives til log. Virksomhetene og lederne i en runde slås opp i
// samme kall.
func FindOrganizations(ctx context.Context, c *tenor.Client, reg *register.Client, q OrganizationQuery, log io.Writer) ([]Organization, error) {
	if len(q.OrganizationNumbers) > 0 {
		q.Count = len(q.OrganizationNumbers)
	}
	sett := map[string]bool{}
	virksomheter := make([]Organization, 0, q.Count)
	ikkeIRegister := 0
	for runde := 0; runde < maksRegisterRunder && len(virksomheter) < q.Count; runde++ {
		kandidater, err := hentForValg(ctx, c, q, q.Count-len(virksomheter))
		if err != nil {
			return nil, err
		}
		var nye []virksomhetKandidat
		for _, k := range kandidater {
			if !sett[k.organisasjonsnummer] {
				sett[k.organisasjonsnummer] = true
				nye = append(nye, k)
			}
		}
		if len(nye) == 0 {
			break
		}

		ider := make([]string, 0, 2*len(nye))
		for _, k := range nye {
			ider = append(ider, k.organisasjonsnummer, k.leder)
		}
		parter, err := reg.LookupIdentifiers(ctx, ider, registerFelt...)
		if err != nil {
			return nil, err
		}

		for _, k := range nye {
			party, funnet := parter[k.organisasjonsnummer]
			leder, lederFunnet := parter[k.leder]
			if !funnet || !lederFunnet {
				ikkeIRegister++
				continue
			}
			virksomheter = append(virksomheter, Organization{
				Rolle:      k.rolle,
				Kildedata:  k.kildedata,
				Party:      party,
				LederParty: leder,
			})
			if len(virksomheter) == q.Count {
				break
			}
		}
	}
	if ikkeIRegister > 0 {
		fmt.Fprintf(log, "Register (%s): %d virksomheter fra Tenor, eller lederen deres, finnes ikke og er byttet ut.\n", q.Env, ikkeIRegister)
	}
	return virksomheter, nil
}

// hentForValg henter antall virksomheter fra Tenor etter q: bestemte
// virksomheter, tilretteleggere med rollen, eller virksomheter med
// organisasjonsformene. Ingenting er slått opp i Register ennå.
func hentForValg(ctx context.Context, c *tenor.Client, q OrganizationQuery, antall int) ([]virksomhetKandidat, error) {
	switch {
	case len(q.OrganizationNumbers) > 0:
		return hentBestemteVirksomheter(ctx, c, q.OrganizationNumbers)
	case q.Role != "":
		rolle, err := FindRole(q.Role)
		if err != nil {
			return nil, err
		}
		return hentTilretteleggere(ctx, c, rolle, antall)
	default:
		return hentVirksomheter(ctx, c, OrganizationKQL(q.UnitTypes), antall)
	}
}

// OrganizationKQL gir KQL for virksomheter med organisasjonsformene. Tom gir
// DefaultUnitType.
func OrganizationKQL(unitTypes []string) string {
	koder := make([]string, len(unitTypes))
	for i, t := range unitTypes {
		koder[i] = strings.ToUpper(t)
	}
	switch len(koder) {
	case 0:
		return tenor.Eq("organisasjonsform.kode", DefaultUnitType)
	case 1:
		return tenor.Eq("organisasjonsform.kode", koder[0])
	default:
		return tenor.OneOf("organisasjonsform.kode", koder...)
	}
}

var organisasjonsnummerRe = regexp.MustCompile(`^\d{9}$`)

// rollegruppe er en gruppe i rollegrupper i et brreg-dokument, f.eks. DAGL
// eller STYR.
type rollegruppe struct {
	Type struct {
		Kode string `json:"kode"`
	} `json:"type"`
	Roller []struct {
		// Type er rollen i gruppen, f.eks. LEDE eller MEDL i STYR.
		Type struct {
			Kode string `json:"kode"`
		} `json:"type"`
		Person struct {
			Foedselsnummer string `json:"foedselsnummer"`
		} `json:"person"`
		// Virksomhet er satt når rollen holdes av en virksomhet, f.eks. en
		// revisor.
		Virksomhet struct {
			Organisasjonsnummer string `json:"organisasjonsnummer"`
		} `json:"virksomhet"`
		// Fratraadt er "J" eller "N".
		Fratraadt string `json:"fratraadt"`
	} `json:"roller"`
}

// leder returnerer fødselsnummeret til daglig leder (DAGL), eller til
// innehaver (INNH) hvis det ikke finnes noen daglig leder. Borettslag og
// eierseksjonssameier har sjelden daglig leder, så for dem er det styreleder
// (LEDE i STYR) når det ikke finnes daglig leder. Fratrådte roller og roller
// uten fødselsnummer hoppes over.
func leder(organisasjonsform string, grupper []rollegruppe) string {
	if fnr := personMedRolle(grupper, "DAGL", ""); fnr != "" {
		return fnr
	}
	if slices.Contains(styreledetUnitTypes, organisasjonsform) {
		return personMedRolle(grupper, "STYR", "LEDE")
	}
	return personMedRolle(grupper, "INNH", "")
}

// personMedRolle returnerer fødselsnummeret til den første personen i
// rollegruppen gruppe, med rollen rolle når den ikke er tom.
func personMedRolle(grupper []rollegruppe, gruppe, rolle string) string {
	for _, g := range grupper {
		if g.Type.Kode != gruppe {
			continue
		}
		for _, r := range g.Roller {
			if (rolle == "" || r.Type.Kode == rolle) && r.Fratraadt != "J" && foedselsnummerRe.MatchString(r.Person.Foedselsnummer) {
				return r.Person.Foedselsnummer
			}
		}
	}
	return ""
}

// hentVirksomheter henter antall unike kandidater fra brreg-er-fr som matcher
// kql og har leder.
func hentVirksomheter(ctx context.Context, c *tenor.Client, kql string, antall int) ([]virksomhetKandidat, error) {
	// Roller kan ikke søkes på i KQL, så kravet om leder sjekkes her.
	harLeder := func(md tenor.Metadata) bool {
		k, ok := tilVirksomhetKandidat(md)
		return ok && k.leder != ""
	}
	dokumenter, err := c.FetchManyFiltered(ctx, tenor.SourceBrreg, kql, antall, harLeder)
	if err != nil {
		return nil, err
	}
	kandidater := make([]virksomhetKandidat, 0, len(dokumenter))
	for _, md := range dokumenter {
		if k, ok := tilVirksomhetKandidat(md); ok {
			kandidater = append(kandidater, k)
		}
	}
	return kandidater, nil
}

// hentBestemteVirksomheter henter virksomhetene med organisasjonsnumrene, i
// samme rekkefølge. De som ikke finnes i Tenor eller mangler leder hoppes
// over.
func hentBestemteVirksomheter(ctx context.Context, c *tenor.Client, orgnumre []string) ([]virksomhetKandidat, error) {
	dokumenter, err := hentPaaOrganisasjonsnummer(ctx, c, orgnumre)
	if err != nil {
		return nil, err
	}
	kandidater := make([]virksomhetKandidat, 0, len(orgnumre))
	for _, orgnr := range orgnumre {
		md, ok := dokumenter[orgnr]
		if !ok {
			continue
		}
		if k, ok := tilVirksomhetKandidat(md); ok && k.leder != "" {
			kandidater = append(kandidater, k)
		}
	}
	return kandidater, nil
}

// tilVirksomhetKandidat gjør om et brreg-dokument til en kandidat. Dokumenter
// uten gyldig organisasjonsnummer hoppes over.
func tilVirksomhetKandidat(md tenor.Metadata) (virksomhetKandidat, bool) {
	var kildedata struct {
		Organisasjonsnummer string `json:"organisasjonsnummer"`
		Organisasjonsform   struct {
			Kode string `json:"kode"`
		} `json:"organisasjonsform"`
		Rollegrupper []rollegruppe `json:"rollegrupper"`
	}
	gyldigJSON := json.Unmarshal([]byte(md.Kildedata), &kildedata) == nil

	orgnr := md.ID
	if !organisasjonsnummerRe.MatchString(orgnr) {
		orgnr = kildedata.Organisasjonsnummer
	}
	if !organisasjonsnummerRe.MatchString(orgnr) {
		return virksomhetKandidat{}, false
	}

	k := virksomhetKandidat{
		organisasjonsnummer: orgnr,
		leder:               leder(kildedata.Organisasjonsform.Kode, kildedata.Rollegrupper),
	}
	if gyldigJSON {
		k.kildedata = json.RawMessage(md.Kildedata)
	}
	return k, true
}
