package parties

import (
	"cmp"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"regexp"
	"strings"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

// DefaultOrganizationKQL gir aksjeselskaper, som i TS-versjonen.
const DefaultOrganizationKQL = "organisasjonsform.kode:AS"

// Organization er en virksomhet fra brreg-er-fr.
type Organization struct {
	Organisasjonsnummer string `json:"organisasjonsnummer"`
	Navn                string `json:"navn"`
	// Organisasjonsform er koden, f.eks. AS eller ENK.
	Organisasjonsform string `json:"organisasjonsform,omitempty"`
	// DagligLeder er fødselsnummeret til daglig leder, eller innehaver for
	// enkeltpersonforetak.
	DagligLeder string `json:"dagligLeder,omitempty"`
	// Rolle er tilretteleggerrollen når virksomheten er hentet med en rolle.
	Rolle string `json:"rolle,omitempty"`
	// Kildedata er hele brreg-dokumentet.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
	// Party er virksomheten i Register. Virksomheter som ikke finnes i Register
	// for miljøet blir ikke med, så den er alltid satt. I JSON ligger feltene
	// fra Register på samme nivå som feltene fra Tenor.
	register.Party
	// DagligLederParty er daglig leder i Register. Virksomheter der daglig
	// leder ikke finnes i Register blir ikke med, så den er alltid satt.
	DagligLederParty *register.Party `json:"dagligLederParty,omitempty"`
}

// OrganizationQuery er hvilke virksomheter FindOrganizations henter.
type OrganizationQuery struct {
	// Count er hvor mange virksomheter som hentes.
	Count int
	// KQL velger virksomhetene når Role er tom. Tom gir
	// DefaultOrganizationKQL.
	KQL string
	// Role er navnet på en rolle i Roles. Da hentes tilretteleggere med den
	// rollen, og KQL brukes ikke.
	Role string
	// Env er miljøet i Register.
	Env string
}

// FindOrganizations henter q.Count virksomheter med daglig leder eller
// innehaver der både virksomheten og daglig leder finnes i Register for
// q.Env. Andre byttes ut med nye fra Tenor, i opptil maksRegisterRunder
// runder, og hvor mange som ble byttet ut skrives til log. Virksomhetene og
// daglige ledere i en runde slås opp i samme kall.
func FindOrganizations(ctx context.Context, c *tenor.Client, reg *register.Client, q OrganizationQuery, log io.Writer) ([]Organization, error) {
	sett := map[string]bool{}
	virksomheter := make([]Organization, 0, q.Count)
	ikkeIRegister := 0
	for runde := 0; runde < maksRegisterRunder && len(virksomheter) < q.Count; runde++ {
		kandidater, err := hentForValg(ctx, c, q, q.Count-len(virksomheter))
		if err != nil {
			return nil, err
		}
		var nye []Organization
		for _, v := range kandidater {
			if !sett[v.Organisasjonsnummer] {
				sett[v.Organisasjonsnummer] = true
				nye = append(nye, v)
			}
		}
		if len(nye) == 0 {
			break
		}

		ider := make([]string, 0, 2*len(nye))
		for _, v := range nye {
			ider = append(ider, v.Organisasjonsnummer, v.DagligLeder)
		}
		parter, err := reg.LookupIdentifiers(ctx, ider, registerFelt...)
		if err != nil {
			return nil, err
		}

		for _, v := range nye {
			party, funnet := parter[v.Organisasjonsnummer]
			leder, lederFunnet := parter[v.DagligLeder]
			if !funnet || !lederFunnet {
				ikkeIRegister++
				continue
			}
			v.Party, v.DagligLederParty = party, &leder
			virksomheter = append(virksomheter, v)
			if len(virksomheter) == q.Count {
				break
			}
		}
	}
	if ikkeIRegister > 0 {
		fmt.Fprintf(log, "Register (%s): %d virksomheter fra Tenor, eller daglig leder for dem, finnes ikke og er byttet ut.\n", q.Env, ikkeIRegister)
	}
	return virksomheter, nil
}

// hentForValg henter antall virksomheter fra Tenor etter q: vanlige
// virksomheter fra KQL, eller tilretteleggere med rollen. Ingenting er slått
// opp i Register ennå.
func hentForValg(ctx context.Context, c *tenor.Client, q OrganizationQuery, antall int) ([]Organization, error) {
	if q.Role == "" {
		return hentVirksomheter(ctx, c, cmp.Or(q.KQL, DefaultOrganizationKQL), antall)
	}
	rolle, err := FindRole(q.Role)
	if err != nil {
		return nil, err
	}
	return hentTilretteleggere(ctx, c, rolle, antall)
}

var organisasjonsnummerRe = regexp.MustCompile(`^\d{9}$`)

// rollegruppe er en gruppe i rollegrupper i et brreg-dokument.
type rollegruppe struct {
	Type struct {
		Kode string `json:"kode"`
	} `json:"type"`
	Roller []struct {
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

// dagligLeder returnerer fødselsnummeret til daglig leder (DAGL), eller til
// innehaver (INNH) hvis det ikke finnes noen daglig leder. Fratrådte roller
// og roller uten fødselsnummer hoppes over.
func dagligLeder(grupper []rollegruppe) string {
	for _, kode := range []string{"DAGL", "INNH"} {
		for _, g := range grupper {
			if g.Type.Kode != kode {
				continue
			}
			for _, r := range g.Roller {
				if r.Fratraadt != "J" && foedselsnummerRe.MatchString(r.Person.Foedselsnummer) {
					return r.Person.Foedselsnummer
				}
			}
		}
	}
	return ""
}

// hentVirksomheter henter antall unike virksomheter fra brreg-er-fr som
// matcher kql og har daglig leder eller innehaver. Tom kql gir
// DefaultOrganizationKQL.
func hentVirksomheter(ctx context.Context, c *tenor.Client, kql string, antall int) ([]Organization, error) {
	if kql == "" {
		kql = DefaultOrganizationKQL
	}
	// Roller kan ikke søkes på i KQL, så kravet om daglig leder sjekkes her.
	harDagligLeder := func(md tenor.Metadata) bool {
		v, ok := tilVirksomhet(md)
		return ok && v.DagligLeder != ""
	}
	dokumenter, err := c.FetchManyFiltered(ctx, tenor.SourceBrreg, kql, antall, harDagligLeder)
	if err != nil {
		return nil, err
	}
	virksomheter := make([]Organization, 0, len(dokumenter))
	for _, md := range dokumenter {
		if v, ok := tilVirksomhet(md); ok {
			virksomheter = append(virksomheter, v)
		}
	}
	return virksomheter, nil
}

// tilVirksomhet gjør om et brreg-dokument til en Organization. Dokumenter uten
// gyldig organisasjonsnummer hoppes over.
func tilVirksomhet(md tenor.Metadata) (Organization, bool) {
	var kildedata struct {
		Organisasjonsnummer string `json:"organisasjonsnummer"`
		Navn                string `json:"navn"`
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
		return Organization{}, false
	}

	v := Organization{
		Organisasjonsnummer: orgnr,
		// Fjerner linjeskift, så ett navn ikke blir flere linjer i utskriften.
		Navn:              strings.Join(strings.Fields(kildedata.Navn), " "),
		Organisasjonsform: kildedata.Organisasjonsform.Kode,
		DagligLeder:       dagligLeder(kildedata.Rollegrupper),
	}
	if gyldigJSON {
		v.Kildedata = json.RawMessage(md.Kildedata)
	}
	return v, true
}
