// Package tenortest has a fake Tenor and Tenor responses for tests.
package tenortest

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

// Token is the token the client from NewClient sends.
const Token = "tok"

// NewClient gives a client for a test server with h.
func NewClient(t *testing.T, h http.HandlerFunc) *tenor.Client {
	t.Helper()
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	return tenor.NewClient(srv.URL, tenor.StaticToken(Token))
}

// FregResponse creates a Tenor response with persons with sequence numbers
// from..to-1. The fødselsnummer is the sequence number with 11 digits, and the
// name is "Person <i>".
func FregResponse(t *testing.T, hits int64, seed int32, from, to int) []byte {
	t.Helper()
	docs := []map[string]any{}
	for i := from; i < to; i++ {
		source, _ := json.Marshal(map[string]any{
			"navn": []map[string]any{{"fornavn": "Person", "etternavn": strconv.Itoa(i), "erGjeldende": true}},
		})
		docs = append(docs, map[string]any{
			"tenorMetadata": map[string]any{"id": fmt.Sprintf("%011d", i), "kildedata": string(source)},
		})
	}
	b, _ := json.Marshal(map[string]any{"treff": hits, "seed": seed, "dokumentListe": docs})
	return b
}

// LeaderSSN is the fødselsnummer of the daglig leder of organization i in
// BrregResponse.
func LeaderSSN(i int) string {
	return fmt.Sprintf("%011d", 50000000000+i)
}

// ChairSSN is the fødselsnummer of the styreleder of organization i in
// BrregResponse.
func ChairSSN(i int) string {
	return fmt.Sprintf("%011d", 60000000000+i)
}

// role is an active role in a role group, held by a person or an organization.
func role(code, person, organization string) map[string]any {
	r := map[string]any{"type": map[string]string{"kode": code}, "fratraadt": "N"}
	if person != "" {
		r["person"] = map[string]string{"foedselsnummer": person}
	}
	if organization != "" {
		r["virksomhet"] = map[string]string{"organisasjonsnummer": organization}
	}
	return r
}

// BrregResponse creates a Tenor response with limited companies (AS) with
// sequence numbers from..to-1, named "FIRMA <i> AS". All have a styreleder
// (ChairSSN) and a board member, but organizations with a sequence number
// divisible by 3 have no daglig leder.
func BrregResponse(t *testing.T, hits int64, seed int32, from, to int) []byte {
	t.Helper()
	docs := []map[string]any{}
	for i := from; i < to; i++ {
		orgNumber := fmt.Sprintf("%09d", i)
		roles := []map[string]any{
			{"type": map[string]string{"kode": "STYR"},
				"roller": []map[string]any{role("MEDL", "11111111111", ""), role("LEDE", ChairSSN(i), "")}},
		}
		if i%3 != 0 {
			roles = append(roles, map[string]any{"type": map[string]string{"kode": "DAGL"},
				"roller": []map[string]any{role("DAGL", LeaderSSN(i), "")}})
		}
		source, _ := json.Marshal(map[string]any{
			"organisasjonsnummer": orgNumber,
			"navn":                fmt.Sprintf("FIRMA\n%d AS", i),
			"organisasjonsform":   map[string]string{"kode": "AS", "beskrivelse": "Aksjeselskap"},
			"rollegrupper":        roles,
		})
		docs = append(docs, map[string]any{
			"tenorMetadata": map[string]any{"id": orgNumber, "kildedata": string(source)},
		})
	}
	b, _ := json.Marshal(map[string]any{"treff": hits, "seed": seed, "dokumentListe": docs})
	return b
}

// BrregDoc creates a brreg document. leader is the daglig leder (empty for
// none), and auditor is the auditor (REVI) (empty for none).
func BrregDoc(orgNumber, name, leader, auditor string) map[string]any {
	groups := []map[string]any{}
	if leader != "" {
		groups = append(groups, map[string]any{"type": map[string]string{"kode": "DAGL"},
			"roller": []map[string]any{role("DAGL", leader, "")}})
	}
	if auditor != "" {
		groups = append(groups, map[string]any{"type": map[string]string{"kode": "REVI"},
			"roller": []map[string]any{role("REVI", "", auditor)}})
	}
	source, _ := json.Marshal(map[string]any{"organisasjonsnummer": orgNumber, "navn": name, "rollegrupper": groups})
	return map[string]any{"tenorMetadata": map[string]any{"id": orgNumber, "kildedata": string(source)}}
}

// SubunitDoc creates an underenhet (BEDR) with the hovedenhet mainUnit, both as
// the role BEDR and in underenhet.hovedenhet, the way Tenor has them.
func SubunitDoc(orgNumber, name, mainUnit string) map[string]any {
	source, _ := json.Marshal(map[string]any{
		"organisasjonsnummer": orgNumber,
		"navn":                name,
		"organisasjonsform":   map[string]string{"kode": "BEDR"},
		"underenhet":          map[string]string{"hovedenhet": mainUnit},
		"rollegrupper": []map[string]any{{"type": map[string]string{"kode": "BEDR"},
			"roller": []map[string]any{role("BEDR", "", mainUnit)}}},
	})
	return map[string]any{"tenorMetadata": map[string]any{"id": orgNumber, "kildedata": string(source)}}
}

// The underenheter and hovedenheter in SubunitClient.
const (
	SubunitWithLeader     = "800000001" // Under MainUnitWithLeader.
	SubunitWithoutLeader  = "800000002" // Under MainUnitWithoutLeader.
	SubunitWithLeader2    = "800000003" // Also under MainUnitWithLeader.
	SubunitOfENK          = "800000004" // Under MainUnitENK.
	MainUnitWithLeader    = "910000001" // AS with daglig leder MainUnitLeader.
	MainUnitWithoutLeader = "910000002" // AS without a daglig leder.
	MainUnitENK           = "910000003" // ENK with innehaver MainUnitOwner.
	MainUnitLeader        = "10000000011"
	MainUnitOwner         = "10000000033"
)

// hovedenhetDoc creates a hovedenhet with the given organisasjonsform and the
// person in the role code (empty person for none).
func hovedenhetDoc(orgNumber, name, form, code, person string) map[string]any {
	groups := []map[string]any{}
	if person != "" {
		groups = append(groups, map[string]any{"type": map[string]string{"kode": code},
			"roller": []map[string]any{role(code, person, "")}})
	}
	source, _ := json.Marshal(map[string]any{"organisasjonsnummer": orgNumber, "navn": name,
		"organisasjonsform": map[string]string{"kode": form}, "rollegrupper": groups})
	return map[string]any{"tenorMetadata": map[string]any{"id": orgNumber, "kildedata": string(source)}}
}

// SubunitClient is a fake Tenor with four underenheter: two under an AS with a
// daglig leder, one under an AS without, and one under an ENK with an
// innehaver. It answers the searches Tenor has fields for:
//   - organizations with at least N underenheter (antallUnderenheter>=N) and
//     the organisasjonsform in the KQL. The hovedenhet with a daglig leder has
//     two.
//   - underenheter of hovedenheter (erUnderenhet.hovedenhet:(a or b))
//   - organizations by organization number (organisasjonsnummer:(a or b))
func SubunitClient(t *testing.T) *tenor.Client {
	t.Helper()
	underenheter := []map[string]any{
		SubunitDoc(SubunitWithLeader, "UNDERENHET EN", MainUnitWithLeader),
		SubunitDoc(SubunitWithoutLeader, "UNDERENHET TO", MainUnitWithoutLeader),
		SubunitDoc(SubunitWithLeader2, "UNDERENHET TRE", MainUnitWithLeader),
		SubunitDoc(SubunitOfENK, "UNDERENHET FIRE", MainUnitENK),
	}
	type hovedenhet struct {
		orgNumber, form string
		doc             map[string]any
		underenheter    []map[string]any
	}
	hovedenheter := []hovedenhet{
		{MainUnitWithLeader, "AS", hovedenhetDoc(MainUnitWithLeader, "HOVEDENHET EN AS", "AS", "DAGL", MainUnitLeader), underenheter[0:1]},
		{MainUnitWithoutLeader, "AS", hovedenhetDoc(MainUnitWithoutLeader, "HOVEDENHET TO AS", "AS", "", ""), underenheter[1:2]},
		{MainUnitENK, "ENK", hovedenhetDoc(MainUnitENK, "HOVEDENHET FIRE", "ENK", "INNH", MainUnitOwner), underenheter[3:4]},
	}
	hovedenheter[0].underenheter = []map[string]any{underenheter[0], underenheter[2]}
	all := map[string]map[string]any{}
	for _, h := range hovedenheter {
		all[h.orgNumber] = h.doc
	}
	for _, u := range underenheter {
		all[u["tenorMetadata"].(map[string]any)["id"].(string)] = u
	}
	orgNumbers := func(kql, field string) []string {
		return strings.Split(strings.Trim(strings.TrimPrefix(kql, field+":"), "()"), " or ")
	}

	return NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql := r.URL.Query().Get("kql")
		var docs []map[string]any
		switch {
		case strings.Contains(kql, "antallUnderenheter>="):
			atLeast, _ := strconv.Atoi(strings.TrimRight(kql[strings.Index(kql, ">=")+2:], ")"))
			for _, h := range hovedenheter {
				if strings.Contains(kql, `"`+h.form+`"`) && len(h.underenheter) >= atLeast {
					docs = append(docs, h.doc)
				}
			}
		case strings.HasPrefix(kql, "erUnderenhet.hovedenhet:("):
			for _, id := range orgNumbers(kql, "erUnderenhet.hovedenhet") {
				for _, h := range hovedenheter {
					if h.orgNumber == id {
						docs = append(docs, h.underenheter...)
					}
				}
			}
		case strings.HasPrefix(kql, "organisasjonsnummer:("):
			for _, id := range orgNumbers(kql, "organisasjonsnummer") {
				if d, ok := all[id]; ok {
					docs = append(docs, d)
				}
			}
		default:
			t.Errorf("unexpected kql %q", kql)
		}
		Respond(w, len(docs), docs...)
	})
}

// Respond writes a Tenor response with the documents.
func Respond(w io.Writer, hits int, docs ...map[string]any) {
	if docs == nil {
		docs = []map[string]any{}
	}
	json.NewEncoder(w).Encode(map[string]any{"treff": hits, "seed": 1, "dokumentListe": docs})
}

// The auditors in AuditorClient.
const (
	AuditorWithLeader    = "900000001"
	AuditorWithoutLeader = "900000002"
	AuditorWithLeader2   = "900000003"
)

// AuditorClient is a fake Tenor with three auditors, found through their
// clients: two with a daglig leder and one without. The auditor with daglig
// leder 10000000001 is named REVISOR EN AS.
func AuditorClient(t *testing.T) *tenor.Client {
	t.Helper()
	auditors := map[string]map[string]any{
		AuditorWithLeader:    BrregDoc(AuditorWithLeader, "REVISOR EN AS", "10000000001", ""),
		AuditorWithoutLeader: BrregDoc(AuditorWithoutLeader, "REVISOR TO AS", "", ""),
		AuditorWithLeader2:   BrregDoc(AuditorWithLeader2, "REVISOR TRE AS", "10000000003", ""),
	}
	// The clients in order, so the candidates become auditor 1, 2 and 3.
	// Auditor 1 has two clients, to check that the same auditor is only
	// included once.
	clients := []map[string]any{
		BrregDoc("100000011", "KLIENT 11 AS", "", AuditorWithLeader),
		BrregDoc("100000012", "KLIENT 12 AS", "", AuditorWithLeader),
		BrregDoc("100000021", "KLIENT 21 AS", "", AuditorWithoutLeader),
		BrregDoc("100000031", "KLIENT 31 AS", "", AuditorWithLeader2),
	}

	return NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql := r.URL.Query().Get("kql")
		switch {
		case kql == "revisorerOrgnr:*":
			Respond(w, len(clients), clients...)
		case strings.HasPrefix(kql, "organisasjonsnummer:("):
			var docs []map[string]any
			for _, id := range strings.Split(strings.Trim(strings.TrimPrefix(kql, "organisasjonsnummer:"), "()"), " or ") {
				if d, ok := auditors[id]; ok {
					docs = append(docs, d)
				}
			}
			Respond(w, len(docs), docs...)
		default:
			t.Errorf("unexpected kql %q", kql)
		}
	})
}
