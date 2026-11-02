package parties

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"regexp"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

// Person er en testperson fra freg som finnes i Register for miljøet. Alt
// utenom Kildedata er fra Register. I JSON ligger feltene fra Register
// (personIdentifier, partyUuid, user og så videre) på samme nivå som
// kildedata.
type Person struct {
	// Kildedata er hele freg-dokumentet fra Tenor.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
	register.Party
}

// personKandidat er en person fra Tenor som ikke er slått opp i Register ennå.
type personKandidat struct {
	foedselsnummer string
	kildedata      json.RawMessage
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
		var nye []personKandidat
		for _, k := range kandidater {
			if !sett[k.foedselsnummer] {
				sett[k.foedselsnummer] = true
				nye = append(nye, k)
			}
		}
		if len(nye) == 0 {
			break
		}

		fnr := make([]string, len(nye))
		for i, k := range nye {
			fnr[i] = k.foedselsnummer
		}
		parter, err := reg.LookupIdentifiers(ctx, fnr, registerFelt...)
		if err != nil {
			return nil, err
		}
		for _, k := range nye {
			party, ok := parter[k.foedselsnummer]
			if !ok {
				ikkeIRegister++
				continue
			}
			personer = append(personer, Person{Kildedata: k.kildedata, Party: party})
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

// hentPersoner henter antall unike kandidater fra freg som matcher kql. Tom
// kql gir DefaultPersonKQL.
func hentPersoner(ctx context.Context, c *tenor.Client, kql string, antall int) ([]personKandidat, error) {
	if kql == "" {
		kql = DefaultPersonKQL(time.Now())
	}
	dokumenter, err := c.FetchMany(ctx, tenor.SourceFreg, kql, antall)
	if err != nil {
		return nil, err
	}
	kandidater := make([]personKandidat, 0, len(dokumenter))
	for _, md := range dokumenter {
		if k, ok := tilPersonKandidat(md); ok {
			kandidater = append(kandidater, k)
		}
	}
	return kandidater, nil
}

// tilPersonKandidat gjør om et freg-dokument til en kandidat. Dokumenter uten
// gyldig fødselsnummer hoppes over, og kildedata som ikke er gyldig JSON tas
// ikke med.
func tilPersonKandidat(md tenor.Metadata) (personKandidat, bool) {
	if !foedselsnummerRe.MatchString(md.ID) {
		return personKandidat{}, false
	}
	k := personKandidat{foedselsnummer: md.ID}
	if json.Valid([]byte(md.Kildedata)) {
		k.kildedata = json.RawMessage(md.Kildedata)
	}
	return k, true
}
