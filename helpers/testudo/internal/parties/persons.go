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

// Person is a test person from freg who exists in Register for the
// environment. Everything except Kildedata is from Register. In JSON the
// fields from Register (personIdentifier, partyUuid, user and so on) are at
// the same level as kildedata.
type Person struct {
	// Kildedata is the whole freg document from Tenor.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
	register.Party
}

// personCandidate is a person from Tenor who has not been looked up in
// Register yet.
type personCandidate struct {
	personIdentifier string
	kildedata        json.RawMessage
}

var personIdentifierRe = regexp.MustCompile(`^\d{11}$`)

// ageOfMajority is the age from which a person is considered an adult.
const ageOfMajority = 18

// DefaultPersonKQL gives persons with personstatus bosatt who have turned 18
// by the date now.
func DefaultPersonKQL(now time.Time) string {
	latest := now.UTC().AddDate(-ageOfMajority, 0, 0)
	return tenor.And(
		tenor.Eq(tenor.FregPersonstatus, tenor.PersonstatusBosatt),
		tenor.DateRange(tenor.FregFoedselsdato, time.Time{}, latest),
	)
}

// FindPersons fetches count persons who match kql and exist both in Tenor and
// in Register for env. Empty kql gives DefaultPersonKQL. Persons who do not
// exist in Register are replaced with new ones from Tenor, in up to
// maxRegisterRounds rounds, and how many were replaced is written to log.
func FindPersons(ctx context.Context, c *tenor.Client, reg *register.Client, kql string, count int, env string, log io.Writer) ([]Person, error) {
	seen := map[string]bool{}
	persons := make([]Person, 0, count)
	notInRegister := 0
	for round := 0; round < maxRegisterRounds && len(persons) < count; round++ {
		candidates, err := fetchPersons(ctx, c, kql, count-len(persons))
		if err != nil {
			return nil, err
		}
		var unseen []personCandidate
		for _, k := range candidates {
			if !seen[k.personIdentifier] {
				seen[k.personIdentifier] = true
				unseen = append(unseen, k)
			}
		}
		if len(unseen) == 0 {
			break
		}

		ids := make([]string, len(unseen))
		for i, k := range unseen {
			ids[i] = k.personIdentifier
		}
		partyByID, err := reg.LookupIdentifiers(ctx, ids, registerFields...)
		if err != nil {
			return nil, err
		}
		for _, k := range unseen {
			party, ok := partyByID[k.personIdentifier]
			if !ok {
				notInRegister++
				continue
			}
			persons = append(persons, Person{Kildedata: k.kildedata, Party: party})
			if len(persons) == count {
				break
			}
		}
	}
	if notInRegister > 0 {
		fmt.Fprintf(log, "Register (%s): %d persons from Tenor do not exist and were replaced.\n", env, notInRegister)
	}
	return persons, nil
}

// fetchPersons fetches count unique candidates from freg that match kql.
// Empty kql gives DefaultPersonKQL.
func fetchPersons(ctx context.Context, c *tenor.Client, kql string, count int) ([]personCandidate, error) {
	if kql == "" {
		kql = DefaultPersonKQL(time.Now())
	}
	documents, err := c.FetchMany(ctx, tenor.SourceFreg, kql, count)
	if err != nil {
		return nil, err
	}
	candidates := make([]personCandidate, 0, len(documents))
	for _, md := range documents {
		if k, ok := toPersonCandidate(md); ok {
			candidates = append(candidates, k)
		}
	}
	return candidates, nil
}

// toPersonCandidate turns a freg document into a candidate. Documents without
// a valid fødselsnummer are skipped, and kildedata that is not valid JSON is
// left out.
func toPersonCandidate(md tenor.Metadata) (personCandidate, bool) {
	if !personIdentifierRe.MatchString(md.ID) {
		return personCandidate{}, false
	}
	k := personCandidate{personIdentifier: md.ID}
	if json.Valid([]byte(md.Kildedata)) {
		k.kildedata = json.RawMessage(md.Kildedata)
	}
	return k, true
}
