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

// UnitTypes er organisasjonsformene FindOrganizations kan hente, med kodene
// fra Enhetsregisteret: aksjeselskap, enkeltpersonforetak,
// eierseksjonssameie, borettslag og norskregistrert utenlandsk foretak.
// Underenhetene deres hentes med OrganizationQuery.Subunits.
var UnitTypes = []string{"AS", "ENK", "ESEK", "BRL", "NUF"}

// DefaultUnitType er organisasjonsformen som hentes når ingen er valgt.
const DefaultUnitType = "AS"

// styreledetUnitTypes er organisasjonsformene som sjelden har daglig leder,
// og der styreleder er lederen.
var styreledetUnitTypes = []string{"ESEK", "BRL"}

// underenhetUnitTypes er underenhetene, av nærings- og
// ikke-næringsdrivende hovedenheter. De har ingen personroller selv, så
// personen er fra hovedenheten, som er rollen med samme kode (BEDR eller
// AAFY) i Enhetsregisteret. Access Management setter ParentId fra den.
var underenhetUnitTypes = []string{"BEDR", "AAFY"}

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
// personen finnes i Register for miljøet. Alt om dem er fra Register. Fra
// Tenor er bare Kildedata, og hvem personen er.
type Organization struct {
	// Rolle er tilretteleggerrollen når virksomheten er hentet med en rolle.
	Rolle string `json:"rolle,omitempty"`
	// Kildedata er hele brreg-dokumentet fra Tenor.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
	// Party er virksomheten i Register. I JSON ligger feltene på samme nivå
	// som rolle og kildedata.
	register.Party
	// PersonRolle er rollen Person har i virksomheten, med navnet i
	// PersonRoles, f.eks. daglig-leder eller styreleder.
	PersonRolle string `json:"personRolle"`
	// Person er personen med PersonRolle i Register. Uten valgt personrolle
	// er det lederen (se leder). For underenheter er personen fra
	// hovedenheten.
	Person register.Party `json:"person"`
	// Hovedenhet er hovedenheten i Register når virksomheten er en
	// underenhet (BEDR eller AAFY).
	Hovedenhet *register.Party `json:"hovedenhet,omitempty"`
}

// virksomhetKandidat er en virksomhet fra Tenor som ikke er slått opp i
// Register ennå.
type virksomhetKandidat struct {
	organisasjonsnummer string
	// person er fødselsnummeret til personen med personRolle. For
	// underenheter er det tomt til hovedenheten er hentet.
	person      string
	personRolle string
	// hovedenhet er organisasjonsnummeret til hovedenheten når virksomheten
	// er en underenhet.
	hovedenhet string
	rolle      string
	kildedata  json.RawMessage
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
	// Subunits henter underenheter (BEDR og AAFY) av virksomheter med
	// organisasjonsformene i UnitTypes, i stedet for virksomhetene selv.
	Subunits bool
	// MinSubunits henter bare virksomheter med minst så mange underenheter,
	// eller med Subunits underenheter av slike. 0 betyr ingen krav, men med
	// Subunits må hovedenheten ha minst én.
	MinSubunits int
	// OrganizationNumbers er virksomhetene som hentes.
	OrganizationNumbers []string
	// Role er navnet på en rolle i Roles. Da hentes tilretteleggere med den
	// rollen.
	Role string
	// PersonRole er navnet på en rolle i PersonRoles. Da hentes bare
	// virksomheter der en person har rollen, og Person er den personen. Tom
	// gir lederen.
	PersonRole string
	// Env er miljøet i Register.
	Env string
}

// FindOrganizations henter q.Count virksomheter med en person med rollen
// q.PersonRole, eller med leder, der både virksomheten og personen finnes i
// Register for q.Env. For underenheter er personen fra hovedenheten, som også
// må finnes i Register. Andre byttes ut med nye fra Tenor, i opptil
// maksRegisterRunder runder, og hvor mange som ble byttet ut skrives til log.
// Alle partene i en runde slås opp i samme kall.
func FindOrganizations(ctx context.Context, c *tenor.Client, reg *register.Client, q OrganizationQuery, log io.Writer) ([]Organization, error) {
	if len(q.OrganizationNumbers) > 0 {
		q.Count = len(q.OrganizationNumbers)
	}
	var personrolle PersonRole
	if q.PersonRole != "" {
		var err error
		if personrolle, err = FindPersonRole(q.PersonRole); err != nil {
			return nil, err
		}
	}

	sett := map[string]bool{}
	virksomheter := make([]Organization, 0, q.Count)
	ikkeIRegister := 0
	for runde := 0; runde < maksRegisterRunder && len(virksomheter) < q.Count; runde++ {
		kandidater, err := hentForValg(ctx, c, q, personrolle, q.Count-len(virksomheter))
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

		ider := make([]string, 0, 3*len(nye))
		for _, k := range nye {
			ider = append(ider, k.organisasjonsnummer, k.person)
			if k.hovedenhet != "" {
				ider = append(ider, k.hovedenhet)
			}
		}
		parter, err := reg.LookupIdentifiers(ctx, ider, registerFelt...)
		if err != nil {
			return nil, err
		}

		for _, k := range nye {
			party, funnet := parter[k.organisasjonsnummer]
			person, personFunnet := parter[k.person]
			var hovedenhet *register.Party
			if k.hovedenhet != "" {
				if h, ok := parter[k.hovedenhet]; ok {
					hovedenhet = &h
				} else {
					funnet = false
				}
			}
			if !funnet || !personFunnet {
				ikkeIRegister++
				continue
			}
			virksomheter = append(virksomheter, Organization{
				Rolle:       k.rolle,
				Kildedata:   k.kildedata,
				Party:       party,
				PersonRolle: k.personRolle,
				Person:      person,
				Hovedenhet:  hovedenhet,
			})
			if len(virksomheter) == q.Count {
				break
			}
		}
	}
	if ikkeIRegister > 0 {
		fmt.Fprintf(log, "Register (%s): %d virksomheter fra Tenor, eller personen eller hovedenheten deres, finnes ikke og er byttet ut.\n", q.Env, ikkeIRegister)
	}
	return virksomheter, nil
}

// hentForValg henter antall virksomheter fra Tenor etter q: bestemte
// virksomheter, tilretteleggere med rollen, eller virksomheter med
// organisasjonsformene. Bare virksomheter med en person med personrolle,
// eller med leder når den er tom, blir med. Ingenting er slått opp i Register
// ennå.
func hentForValg(ctx context.Context, c *tenor.Client, q OrganizationQuery, personrolle PersonRole, antall int) ([]virksomhetKandidat, error) {
	switch {
	case len(q.OrganizationNumbers) > 0:
		kandidater, err := hentBestemteVirksomheter(ctx, c, q.OrganizationNumbers, personrolle)
		if err != nil {
			return nil, err
		}
		return medHovedenheter(ctx, c, kandidater, personrolle)
	case q.Role != "":
		rolle, err := FindRole(q.Role)
		if err != nil {
			return nil, err
		}
		return hentTilretteleggere(ctx, c, rolle, personrolle, antall)
	case q.Subunits:
		return hentUnderenheter(ctx, c, q.KQL(), personrolle, antall)
	default:
		kandidater, err := hentVirksomheter(ctx, c, q.KQL(), personrolle, antall)
		if err != nil {
			return nil, err
		}
		// Gjør ingenting uten underenheter blant kandidatene.
		return medHovedenheter(ctx, c, kandidater, personrolle)
	}
}

// KQL er søket etter virksomhetene med organisasjonsformene i q.UnitTypes,
// eller etter hovedenhetene når q.Subunits er satt. Med q.MinSubunits, eller
// q.Subunits, må de ha minst så mange underenheter.
func (q OrganizationQuery) KQL() string {
	if !q.Subunits && q.MinSubunits <= 0 {
		return OrganizationKQL(q.UnitTypes)
	}
	minst := strconv.Itoa(max(1, q.MinSubunits))
	return tenor.And(OrganizationKQL(q.UnitTypes), tenor.Compare("antallUnderenheter", tenor.GreaterOrEqual, minst))
}

// underenheterPerSoek er hvor mange hovedenheter underenhetene hentes for i
// ett søk med erUnderenhet.hovedenhet:(a or b ...). En hovedenhet kan ha
// mange underenheter, og et søk gir høyst tenor.MaxPerPage.
const underenheterPerSoek = 20

// hentUnderenheter henter antall underenheter (BEDR og AAFY), én per
// hovedenhet. Hovedenhetene matcher kql, som må kreve underenheter, og har en
// person med personrolle, eller leder, som underenheten får.
func hentUnderenheter(ctx context.Context, c *tenor.Client, kql string, personrolle PersonRole, antall int) ([]virksomhetKandidat, error) {
	hovedenheter, err := hentVirksomheter(ctx, c, kql, personrolle, antall)
	if err != nil {
		return nil, err
	}
	orgnumre := make([]string, len(hovedenheter))
	for i, h := range hovedenheter {
		orgnumre[i] = h.organisasjonsnummer
	}
	underenheter, err := hentForsteUnderenhet(ctx, c, orgnumre)
	if err != nil {
		return nil, err
	}

	kandidater := make([]virksomhetKandidat, 0, len(hovedenheter))
	for _, h := range hovedenheter {
		u, ok := underenheter[h.organisasjonsnummer]
		if !ok {
			continue
		}
		u.person, u.personRolle = h.person, h.personRolle
		kandidater = append(kandidater, u)
	}
	return kandidater, nil
}

// hentForsteUnderenhet henter den første underenheten Tenor gir for hver av
// hovedenhetene, mange om gangen. Hovedenheter der ingen underenhet kom med,
// er ikke med i svaret.
func hentForsteUnderenhet(ctx context.Context, c *tenor.Client, hovedenheter []string) (map[string]virksomhetKandidat, error) {
	underenheter := make(map[string]virksomhetKandidat, len(hovedenheter))
	for start := 0; start < len(hovedenheter); start += underenheterPerSoek {
		batch := hovedenheter[start:min(start+underenheterPerSoek, len(hovedenheter))]
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
			u, ok := tilVirksomhetKandidat(md, PersonRole{})
			if _, finnes := underenheter[u.hovedenhet]; ok && u.hovedenhet != "" && !finnes {
				underenheter[u.hovedenhet] = u
			}
		}
	}
	return underenheter, nil
}

// medHovedenheter henter hovedenhetene til underenhetene blant kandidatene,
// mange om gangen, og gir underenhetene personen med personrolle, eller
// lederen, fra hovedenheten. Underenheter der hovedenheten ikke finnes i
// Tenor eller mangler personen forkastes. Andre kandidater er uendret.
func medHovedenheter(ctx context.Context, c *tenor.Client, kandidater []virksomhetKandidat, personrolle PersonRole) ([]virksomhetKandidat, error) {
	var orgnumre []string
	for _, k := range kandidater {
		if k.hovedenhet != "" && !slices.Contains(orgnumre, k.hovedenhet) {
			orgnumre = append(orgnumre, k.hovedenhet)
		}
	}
	if len(orgnumre) == 0 {
		return kandidater, nil
	}
	dokumenter, err := hentPaaOrganisasjonsnummer(ctx, c, orgnumre)
	if err != nil {
		return nil, err
	}
	beholdt := make([]virksomhetKandidat, 0, len(kandidater))
	for _, k := range kandidater {
		if k.hovedenhet != "" {
			md, ok := dokumenter[k.hovedenhet]
			if !ok {
				continue
			}
			h, ok := tilVirksomhetKandidat(md, personrolle)
			if !ok || h.person == "" {
				continue
			}
			k.person, k.personRolle = h.person, h.personRolle
		}
		beholdt = append(beholdt, k)
	}
	return beholdt, nil
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
		// Type er rollen, f.eks. DAGL, eller LEDE og MEDL i STYR.
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
// innehaver (INNH) hvis det ikke finnes noen daglig leder, og koden for
// rollen. Borettslag og eierseksjonssameier har sjelden daglig leder, så for
// dem er det styreleder (LEDE) når det ikke finnes daglig leder.
func leder(organisasjonsform string, grupper []rollegruppe) (fnr, kode string) {
	koder := []string{"DAGL", "INNH"}
	if slices.Contains(styreledetUnitTypes, organisasjonsform) {
		koder = []string{"DAGL", "LEDE"}
	}
	for _, kode := range koder {
		if fnr := personMedRolle(grupper, kode); fnr != "" {
			return fnr, kode
		}
	}
	return "", ""
}

// personMedRolle returnerer fødselsnummeret til den første personen med
// rollekoden, f.eks. DAGL eller MEDL. Fratrådte roller og roller uten
// fødselsnummer hoppes over.
func personMedRolle(grupper []rollegruppe, kode string) string {
	for _, g := range grupper {
		for _, r := range g.Roller {
			if r.Type.Kode == kode && r.Fratraadt != "J" && foedselsnummerRe.MatchString(r.Person.Foedselsnummer) {
				return r.Person.Foedselsnummer
			}
		}
	}
	return ""
}

// virksomhetMedRolle returnerer organisasjonsnummeret til den første
// virksomheten med rollekoden, f.eks. BEDR.
func virksomhetMedRolle(grupper []rollegruppe, kode string) string {
	for _, g := range grupper {
		for _, r := range g.Roller {
			if r.Type.Kode == kode && r.Fratraadt != "J" && organisasjonsnummerRe.MatchString(r.Virksomhet.Organisasjonsnummer) {
				return r.Virksomhet.Organisasjonsnummer
			}
		}
	}
	return ""
}

// harPersonEllerHovedenhet er om kandidaten har personen, eller er en
// underenhet som kan få den fra hovedenheten.
func (k virksomhetKandidat) harPersonEllerHovedenhet() bool {
	return k.person != "" || k.hovedenhet != ""
}

// hentVirksomheter henter antall unike kandidater fra brreg-er-fr som matcher
// kql og har en person med personrolle, eller leder når den er tom.
// Underenheter tas med når de har hovedenhet, og må få personen med
// medHovedenheter.
func hentVirksomheter(ctx context.Context, c *tenor.Client, kql string, personrolle PersonRole, antall int) ([]virksomhetKandidat, error) {
	// Ikke alle rollene i PersonRoles har søkefelt i Tenor (f.eks. prokurist),
	// så kravet om personen sjekkes her.
	harPerson := func(md tenor.Metadata) bool {
		k, ok := tilVirksomhetKandidat(md, personrolle)
		return ok && k.harPersonEllerHovedenhet()
	}
	dokumenter, err := c.FetchManyFiltered(ctx, tenor.SourceBrreg, kql, antall, harPerson)
	if err != nil {
		return nil, err
	}
	kandidater := make([]virksomhetKandidat, 0, len(dokumenter))
	for _, md := range dokumenter {
		if k, ok := tilVirksomhetKandidat(md, personrolle); ok {
			kandidater = append(kandidater, k)
		}
	}
	return kandidater, nil
}

// hentBestemteVirksomheter henter virksomhetene med organisasjonsnumrene, i
// samme rekkefølge. De som ikke finnes i Tenor eller mangler personen hoppes
// over. Underenheter må få personen med medHovedenheter.
func hentBestemteVirksomheter(ctx context.Context, c *tenor.Client, orgnumre []string, personrolle PersonRole) ([]virksomhetKandidat, error) {
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
		if k, ok := tilVirksomhetKandidat(md, personrolle); ok && k.harPersonEllerHovedenhet() {
			kandidater = append(kandidater, k)
		}
	}
	return kandidater, nil
}

// tilVirksomhetKandidat gjør om et brreg-dokument til en kandidat, med
// personen med personrolle, eller lederen når den er tom. For underenheter er
// det hovedenheten, fra rollen BEDR eller AAFY, eller fra underenhet.hovedenhet
// hvis rollen mangler. Dokumenter uten gyldig organisasjonsnummer hoppes over.
func tilVirksomhetKandidat(md tenor.Metadata, personrolle PersonRole) (virksomhetKandidat, bool) {
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
	gyldigJSON := json.Unmarshal([]byte(md.Kildedata), &kildedata) == nil

	orgnr := md.ID
	if !organisasjonsnummerRe.MatchString(orgnr) {
		orgnr = kildedata.Organisasjonsnummer
	}
	if !organisasjonsnummerRe.MatchString(orgnr) {
		return virksomhetKandidat{}, false
	}

	form := kildedata.Organisasjonsform.Kode
	k := virksomhetKandidat{organisasjonsnummer: orgnr}
	if slices.Contains(underenhetUnitTypes, form) {
		k.hovedenhet = virksomhetMedRolle(kildedata.Rollegrupper, form)
		if k.hovedenhet == "" && organisasjonsnummerRe.MatchString(kildedata.Underenhet.Hovedenhet) {
			k.hovedenhet = kildedata.Underenhet.Hovedenhet
		}
	} else if personrolle.Code != "" {
		k.person = personMedRolle(kildedata.Rollegrupper, personrolle.Code)
		k.personRolle = personrolle.Name
	} else if fnr, kode := leder(kildedata.Organisasjonsform.Kode, kildedata.Rollegrupper); fnr != "" {
		k.person, k.personRolle = fnr, personRoleByCode(kode).Name
	}
	if gyldigJSON {
		k.kildedata = json.RawMessage(md.Kildedata)
	}
	return k, true
}
