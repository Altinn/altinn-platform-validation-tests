package parties

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"regexp"
	"strings"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

// Person er en testperson fra freg med parten fra Register. Personer som ikke
// finnes i Register for miljøet blir ikke med, så Party er alltid satt. I JSON
// ligger feltene fra Register (partyUuid, partyId, user og så videre) på samme
// nivå som feltene fra Tenor.
type Person struct {
	Foedselsnummer string `json:"foedselsnummer"`
	Fornavn        string `json:"fornavn,omitempty"`
	Mellomnavn     string `json:"mellomnavn,omitempty"`
	Etternavn      string `json:"etternavn,omitempty"`
	// Navn er fornavn, mellomnavn og etternavn med mellomrom.
	Navn string `json:"navn,omitempty"`
	// Kildedata er hele freg-dokumentet.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
	register.Party
}

var foedselsnummerRe = regexp.MustCompile(`^\d{11}$`)

// myndighetsalder er alderen en person regnes som myndig fra.
const myndighetsalder = 18

// DefaultPersonKQL gir personer med personstatus bosatt som har fylt 18 år
// på datoen naa.
func DefaultPersonKQL(naa time.Time) string {
	senest := naa.UTC().AddDate(-myndighetsalder, 0, 0)
	return tenor.And(
		tenor.Eq(tenor.FregPersonstatus, tenor.PersonstatusBosatt),
		tenor.DateRange(tenor.FregFoedselsdato, time.Time{}, senest),
	)
}

// FindPersons henter count personer som matcher kql og finnes både i Tenor og
// i Register for env. Tom kql gir DefaultPersonKQL. Personer som ikke finnes i
// Register byttes ut med nye fra Tenor, i opptil maksRegisterRunder runder,
// og hvor mange som ble byttet ut skrives til log.
func FindPersons(ctx context.Context, c *tenor.Client, reg *register.Client, kql string, count int, env string, log io.Writer) ([]Person, error) {
	sett := map[string]bool{}
	personer := make([]Person, 0, count)
	ikkeIRegister := 0
	for runde := 0; runde < maksRegisterRunder && len(personer) < count; runde++ {
		kandidater, err := hentPersoner(ctx, c, kql, count-len(personer))
		if err != nil {
			return nil, err
		}
		var nye []Person
		for _, p := range kandidater {
			if !sett[p.Foedselsnummer] {
				sett[p.Foedselsnummer] = true
				nye = append(nye, p)
			}
		}
		if len(nye) == 0 {
			break
		}

		fnr := make([]string, len(nye))
		for i, p := range nye {
			fnr[i] = p.Foedselsnummer
		}
		parter, err := reg.LookupIdentifiers(ctx, fnr, registerFelt...)
		if err != nil {
			return nil, err
		}
		for _, p := range nye {
			party, ok := parter[p.Foedselsnummer]
			if !ok {
				ikkeIRegister++
				continue
			}
			p.Party = party
			personer = append(personer, p)
			if len(personer) == count {
				break
			}
		}
	}
	if ikkeIRegister > 0 {
		fmt.Fprintf(log, "Register (%s): %d personer fra Tenor finnes ikke og er byttet ut.\n", env, ikkeIRegister)
	}
	return personer, nil
}

// hentPersoner henter antall unike testpersoner fra freg som matcher kql, uten
// parten fra Register. Tom kql gir DefaultPersonKQL.
func hentPersoner(ctx context.Context, c *tenor.Client, kql string, antall int) ([]Person, error) {
	if kql == "" {
		kql = DefaultPersonKQL(time.Now())
	}
	dokumenter, err := c.FetchMany(ctx, tenor.SourceFreg, kql, antall)
	if err != nil {
		return nil, err
	}
	personer := make([]Person, 0, len(dokumenter))
	for _, md := range dokumenter {
		if p, ok := tilPerson(md); ok {
			personer = append(personer, p)
		}
	}
	return personer, nil
}

// tilPerson gjør om et freg-dokument til en Person. Dokumenter uten gyldig
// fødselsnummer hoppes over.
func tilPerson(md tenor.Metadata) (Person, bool) {
	if !foedselsnummerRe.MatchString(md.ID) {
		return Person{}, false
	}
	p := Person{Foedselsnummer: md.ID}

	var kildedata struct {
		Navn []struct {
			Fornavn     string `json:"fornavn"`
			Mellomnavn  string `json:"mellomnavn"`
			Etternavn   string `json:"etternavn"`
			ErGjeldende bool   `json:"erGjeldende"`
		} `json:"navn"`
	}
	if err := json.Unmarshal([]byte(md.Kildedata), &kildedata); err != nil {
		return p, true
	}
	p.Kildedata = json.RawMessage(md.Kildedata)

	// Bruk gjeldende navn, ellers det første.
	for i, n := range kildedata.Navn {
		if i == 0 || n.ErGjeldende {
			p.Fornavn, p.Mellomnavn, p.Etternavn = n.Fornavn, n.Mellomnavn, n.Etternavn
		}
		if n.ErGjeldende {
			break
		}
	}
	p.Navn = strings.Join(strings.Fields(p.Fornavn+" "+p.Mellomnavn+" "+p.Etternavn), " ")
	return p, true
}
