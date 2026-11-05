// Package tenortest har en falsk Tenor og Tenor-svar for tester.
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

// Token er tokenet klienten fra NewClient sender.
const Token = "tok"

// NewClient gir en klient mot en testserver med h.
func NewClient(t *testing.T, h http.HandlerFunc) *tenor.Client {
	t.Helper()
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	return tenor.NewClient(srv.URL, tenor.StaticToken(Token))
}

// FregResponse lager et Tenor-svar med personer med løpenummer from..to-1.
// Fødselsnummeret er løpenummeret med 11 siffer, og navnet er "Person <i>".
func FregResponse(t *testing.T, hits int64, seed int32, from, to int) []byte {
	t.Helper()
	docs := []map[string]any{}
	for i := from; i < to; i++ {
		kilde, _ := json.Marshal(map[string]any{
			"navn": []map[string]any{{"fornavn": "Person", "etternavn": strconv.Itoa(i), "erGjeldende": true}},
		})
		docs = append(docs, map[string]any{
			"tenorMetadata": map[string]any{"id": fmt.Sprintf("%011d", i), "kildedata": string(kilde)},
		})
	}
	b, _ := json.Marshal(map[string]any{"treff": hits, "seed": seed, "dokumentListe": docs})
	return b
}

// LeaderSSN er fødselsnummeret til daglig leder i virksomhet i i
// BrregResponse.
func LeaderSSN(i int) string {
	return fmt.Sprintf("%011d", 50000000000+i)
}

// ChairSSN er fødselsnummeret til styreleder i virksomhet i i BrregResponse.
func ChairSSN(i int) string {
	return fmt.Sprintf("%011d", 60000000000+i)
}

// rolle er en aktiv rolle i en rollegruppe, med en person eller en virksomhet.
func rolle(kode, person, virksomhet string) map[string]any {
	r := map[string]any{"type": map[string]string{"kode": kode}, "fratraadt": "N"}
	if person != "" {
		r["person"] = map[string]string{"foedselsnummer": person}
	}
	if virksomhet != "" {
		r["virksomhet"] = map[string]string{"organisasjonsnummer": virksomhet}
	}
	return r
}

// BrregResponse lager et Tenor-svar med aksjeselskaper med løpenummer
// from..to-1, med navnet "FIRMA <i> AS". Alle har styreleder (ChairSSN) og et
// styremedlem, men virksomheter med løpenummer delelig med 3 har ingen daglig
// leder.
func BrregResponse(t *testing.T, hits int64, seed int32, from, to int) []byte {
	t.Helper()
	docs := []map[string]any{}
	for i := from; i < to; i++ {
		orgnr := fmt.Sprintf("%09d", i)
		roller := []map[string]any{
			{"type": map[string]string{"kode": "STYR"},
				"roller": []map[string]any{rolle("MEDL", "11111111111", ""), rolle("LEDE", ChairSSN(i), "")}},
		}
		if i%3 != 0 {
			roller = append(roller, map[string]any{"type": map[string]string{"kode": "DAGL"},
				"roller": []map[string]any{rolle("DAGL", LeaderSSN(i), "")}})
		}
		kilde, _ := json.Marshal(map[string]any{
			"organisasjonsnummer": orgnr,
			"navn":                fmt.Sprintf("FIRMA\n%d AS", i),
			"organisasjonsform":   map[string]string{"kode": "AS", "beskrivelse": "Aksjeselskap"},
			"rollegrupper":        roller,
		})
		docs = append(docs, map[string]any{
			"tenorMetadata": map[string]any{"id": orgnr, "kildedata": string(kilde)},
		})
	}
	b, _ := json.Marshal(map[string]any{"treff": hits, "seed": seed, "dokumentListe": docs})
	return b
}

// BrregDoc lager et brreg-dokument. leader er daglig leder (tom for ingen), og
// auditor er revisoren (REVI) (tom for ingen).
func BrregDoc(orgnr, name, leader, auditor string) map[string]any {
	grupper := []map[string]any{}
	if leader != "" {
		grupper = append(grupper, map[string]any{"type": map[string]string{"kode": "DAGL"},
			"roller": []map[string]any{rolle("DAGL", leader, "")}})
	}
	if auditor != "" {
		grupper = append(grupper, map[string]any{"type": map[string]string{"kode": "REVI"},
			"roller": []map[string]any{rolle("REVI", "", auditor)}})
	}
	kilde, _ := json.Marshal(map[string]any{"organisasjonsnummer": orgnr, "navn": name, "rollegrupper": grupper})
	return map[string]any{"tenorMetadata": map[string]any{"id": orgnr, "kildedata": string(kilde)}}
}

// SubunitDoc lager en underenhet (BEDR) med hovedenheten mainUnit, både som
// rollen BEDR og i underenhet.hovedenhet, slik Tenor har dem.
func SubunitDoc(orgnr, name, mainUnit string) map[string]any {
	kilde, _ := json.Marshal(map[string]any{
		"organisasjonsnummer": orgnr,
		"navn":                name,
		"organisasjonsform":   map[string]string{"kode": "BEDR"},
		"underenhet":          map[string]string{"hovedenhet": mainUnit},
		"rollegrupper": []map[string]any{{"type": map[string]string{"kode": "BEDR"},
			"roller": []map[string]any{rolle("BEDR", "", mainUnit)}}},
	})
	return map[string]any{"tenorMetadata": map[string]any{"id": orgnr, "kildedata": string(kilde)}}
}

// Underenhetene og hovedenhetene i SubunitClient.
const (
	SubunitWithLeader     = "800000001" // Under MainUnitWithLeader.
	SubunitWithoutLeader  = "800000002" // Under MainUnitWithoutLeader.
	SubunitWithLeader2    = "800000003" // Også under MainUnitWithLeader.
	SubunitOfENK          = "800000004" // Under MainUnitENK.
	MainUnitWithLeader    = "910000001" // AS med daglig leder MainUnitLeader.
	MainUnitWithoutLeader = "910000002" // AS uten daglig leder.
	MainUnitENK           = "910000003" // ENK med innehaver MainUnitOwner.
	MainUnitLeader        = "10000000011"
	MainUnitOwner         = "10000000033"
)

// hovedenhetDoc lager en hovedenhet med organisasjonsformen og personen i
// rollen kode (tom person for ingen).
func hovedenhetDoc(orgnr, name, form, kode, person string) map[string]any {
	grupper := []map[string]any{}
	if person != "" {
		grupper = append(grupper, map[string]any{"type": map[string]string{"kode": kode},
			"roller": []map[string]any{rolle(kode, person, "")}})
	}
	kilde, _ := json.Marshal(map[string]any{"organisasjonsnummer": orgnr, "navn": name,
		"organisasjonsform": map[string]string{"kode": form}, "rollegrupper": grupper})
	return map[string]any{"tenorMetadata": map[string]any{"id": orgnr, "kildedata": string(kilde)}}
}

// SubunitClient er en falsk Tenor med fire underenheter: to under et AS med
// daglig leder, én under et AS uten, og én under et ENK med innehaver. Den
// svarer på søkene Tenor har felt for:
//   - virksomheter med minst N underenheter (antallUnderenheter>=N) og
//     organisasjonsformen i KQL. Hovedenheten med daglig leder har to.
//   - underenheter av hovedenheter (erUnderenhet.hovedenhet:(a or b))
//   - virksomheter på organisasjonsnummer (organisasjonsnummer:(a or b))
func SubunitClient(t *testing.T) *tenor.Client {
	t.Helper()
	underenheter := []map[string]any{
		SubunitDoc(SubunitWithLeader, "UNDERENHET EN", MainUnitWithLeader),
		SubunitDoc(SubunitWithoutLeader, "UNDERENHET TO", MainUnitWithoutLeader),
		SubunitDoc(SubunitWithLeader2, "UNDERENHET TRE", MainUnitWithLeader),
		SubunitDoc(SubunitOfENK, "UNDERENHET FIRE", MainUnitENK),
	}
	type hovedenhet struct {
		orgnr, form  string
		doc          map[string]any
		underenheter []map[string]any
	}
	hovedenheter := []hovedenhet{
		{MainUnitWithLeader, "AS", hovedenhetDoc(MainUnitWithLeader, "HOVEDENHET EN AS", "AS", "DAGL", MainUnitLeader), underenheter[0:1]},
		{MainUnitWithoutLeader, "AS", hovedenhetDoc(MainUnitWithoutLeader, "HOVEDENHET TO AS", "AS", "", ""), underenheter[1:2]},
		{MainUnitENK, "ENK", hovedenhetDoc(MainUnitENK, "HOVEDENHET FIRE", "ENK", "INNH", MainUnitOwner), underenheter[3:4]},
	}
	hovedenheter[0].underenheter = []map[string]any{underenheter[0], underenheter[2]}
	alle := map[string]map[string]any{}
	for _, h := range hovedenheter {
		alle[h.orgnr] = h.doc
	}
	for _, u := range underenheter {
		alle[u["tenorMetadata"].(map[string]any)["id"].(string)] = u
	}
	orgnumre := func(kql, felt string) []string {
		return strings.Split(strings.Trim(strings.TrimPrefix(kql, felt+":"), "()"), " or ")
	}

	return NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql := r.URL.Query().Get("kql")
		var docs []map[string]any
		switch {
		case strings.Contains(kql, "antallUnderenheter>="):
			minst, _ := strconv.Atoi(strings.TrimRight(kql[strings.Index(kql, ">=")+2:], ")"))
			for _, h := range hovedenheter {
				if strings.Contains(kql, `"`+h.form+`"`) && len(h.underenheter) >= minst {
					docs = append(docs, h.doc)
				}
			}
		case strings.HasPrefix(kql, "erUnderenhet.hovedenhet:("):
			for _, id := range orgnumre(kql, "erUnderenhet.hovedenhet") {
				for _, h := range hovedenheter {
					if h.orgnr == id {
						docs = append(docs, h.underenheter...)
					}
				}
			}
		case strings.HasPrefix(kql, "organisasjonsnummer:("):
			for _, id := range orgnumre(kql, "organisasjonsnummer") {
				if d, ok := alle[id]; ok {
					docs = append(docs, d)
				}
			}
		default:
			t.Errorf("uventet kql %q", kql)
		}
		Respond(w, len(docs), docs...)
	})
}

// Respond skriver et Tenor-svar med dokumentene.
func Respond(w io.Writer, hits int, docs ...map[string]any) {
	if docs == nil {
		docs = []map[string]any{}
	}
	json.NewEncoder(w).Encode(map[string]any{"treff": hits, "seed": 1, "dokumentListe": docs})
}

// Revisorene i AuditorClient.
const (
	AuditorWithLeader    = "900000001"
	AuditorWithoutLeader = "900000002"
	AuditorWithLeader2   = "900000003"
)

// AuditorClient er en falsk Tenor med tre revisorer, funnet via klientene
// sine: to med daglig leder og én uten. Revisoren med daglig leder
// 10000000001 heter REVISOR EN AS.
func AuditorClient(t *testing.T) *tenor.Client {
	t.Helper()
	revisorer := map[string]map[string]any{
		AuditorWithLeader:    BrregDoc(AuditorWithLeader, "REVISOR EN AS", "10000000001", ""),
		AuditorWithoutLeader: BrregDoc(AuditorWithoutLeader, "REVISOR TO AS", "", ""),
		AuditorWithLeader2:   BrregDoc(AuditorWithLeader2, "REVISOR TRE AS", "10000000003", ""),
	}
	// Klientene i rekkefølge, så kandidatene blir revisor 1, 2 og 3. Revisor 1
	// har to klienter, for å sjekke at samme revisor bare tas med én gang.
	klienter := []map[string]any{
		BrregDoc("100000011", "KLIENT 11 AS", "", AuditorWithLeader),
		BrregDoc("100000012", "KLIENT 12 AS", "", AuditorWithLeader),
		BrregDoc("100000021", "KLIENT 21 AS", "", AuditorWithoutLeader),
		BrregDoc("100000031", "KLIENT 31 AS", "", AuditorWithLeader2),
	}

	return NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql := r.URL.Query().Get("kql")
		switch {
		case kql == "revisorerOrgnr:*":
			Respond(w, len(klienter), klienter...)
		case strings.HasPrefix(kql, "organisasjonsnummer:("):
			var docs []map[string]any
			for _, id := range strings.Split(strings.Trim(strings.TrimPrefix(kql, "organisasjonsnummer:"), "()"), " or ") {
				if d, ok := revisorer[id]; ok {
					docs = append(docs, d)
				}
			}
			Respond(w, len(docs), docs...)
		default:
			t.Errorf("uventet kql %q", kql)
		}
	})
}
