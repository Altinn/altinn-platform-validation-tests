package parties

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register/registertest"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor/tenortest"
)

func TestHentVirksomheter(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/testnorge/v2/soek/brreg-er-fr" {
			t.Errorf("path = %q", r.URL.Path)
		}
		if kql := r.URL.Query().Get("kql"); kql != "organisasjonsform.kode:AS" {
			t.Errorf("kql = %q", kql)
		}
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	v, err := hentVirksomheter(context.Background(), c, "", 5)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || v[0].Organisasjonsnummer != "000000001" || v[0].Navn != "FIRMA 1 AS" ||
		v[0].Organisasjonsform != "AS" || v[0].DagligLeder != tenortest.LeaderSSN(1) || v[0].Kildedata == nil {
		t.Errorf("virksomheter = %+v", v)
	}
}

func TestHentVirksomheterKreverDagligLeder(t *testing.T) {
	var seeds []string
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		seeds = append(seeds, q.Get("seed"))
		// Med filter hentes minst 20 per kall, selv om vi bare vil ha 4.
		if q.Get("antall") != "20" {
			t.Errorf("antall = %q", q.Get("antall"))
		}
		// Hver seed gir 3 nye virksomheter: 1 og 2 har leder, 3 har ikke.
		seed := int32(10)
		if s := q.Get("seed"); s != "" {
			n, _ := strconv.Atoi(s)
			seed = int32(n)
		}
		start := int(seed-10)*3 + 1
		w.Write(tenortest.BrregResponse(t, 1000, seed, start, start+3))
	})

	v, err := hentVirksomheter(context.Background(), c, "", 4)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 4 {
		t.Fatalf("virksomheter = %d", len(v))
	}
	for _, x := range v {
		if x.DagligLeder == "" {
			t.Errorf("virksomhet uten daglig leder: %+v", x)
		}
	}
	// 2 med leder per kall, så 2 kall for 4.
	if fmt.Sprint(seeds) != "[ 11]" {
		t.Errorf("seeds = %q", seeds)
	}
}

func TestHentVirksomheterStopperNaarAlleErSett(t *testing.T) {
	kall := 0
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kall++
		// 3 treff totalt, bare 2 har daglig leder.
		w.Write(tenortest.BrregResponse(t, 3, 1, 1, 4))
	})
	v, err := hentVirksomheter(context.Background(), c, "", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || kall != 1 {
		t.Errorf("virksomheter = %d, kall = %d", len(v), kall)
	}
}

func TestFindOrganizationsKreverDagligLederIRegister(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := registertest.ReadQuery(t, r)
		vil := []string{
			"urn:altinn:organization:identifier-no:000000001", "urn:altinn:person:identifier-no:" + tenortest.LeaderSSN(1),
			"urn:altinn:organization:identifier-no:000000002", "urn:altinn:person:identifier-no:" + tenortest.LeaderSSN(2),
		}
		if fmt.Sprint(urns) != fmt.Sprint(vil) {
			t.Errorf("urns = %v", urns)
		}
		// Virksomhet 1 og lederen dens finnes. For virksomhet 2 finnes bare
		// lederen, så den blir ikke med.
		fmt.Fprintf(w, `{"data":[
			{"partyUuid":"o-1","partyId":601,"organizationIdentifier":"000000001"},
			{"partyUuid":"p-1","partyId":701,"personIdentifier":"%s"},
			{"partyUuid":"p-2","partyId":702,"personIdentifier":"%s"}]}`,
			tenortest.LeaderSSN(1), tenortest.LeaderSSN(2))
	})

	var logg bytes.Buffer
	v, err := FindOrganizations(context.Background(), c, reg, OrganizationQuery{Count: 2, Env: "at22"}, &logg)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 1 || v[0].PartyUUID != "o-1" || v[0].DagligLederParty == nil || v[0].DagligLederParty.PartyID != 701 {
		t.Fatalf("virksomheter = %+v", v)
	}
	if !strings.Contains(logg.String(), "Register (at22): 1 virksomheter fra Tenor, eller daglig leder for dem, finnes ikke") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestDagligLeder(t *testing.T) {
	les := func(s string) []rollegruppe {
		var g []rollegruppe
		if err := json.Unmarshal([]byte(s), &g); err != nil {
			t.Fatal(err)
		}
		return g
	}
	tests := []struct {
		navn, grupper, vil string
	}{
		{"DAGL", `[{"type":{"kode":"DAGL"},"roller":[{"person":{"foedselsnummer":"22222222222"},"fratraadt":"N"}]}]`, "22222222222"},
		{"INNH", `[{"type":{"kode":"INNH"},"roller":[{"person":{"foedselsnummer":"33333333333"}}]}]`, "33333333333"},
		{"DAGL går foran INNH",
			`[{"type":{"kode":"INNH"},"roller":[{"person":{"foedselsnummer":"33333333333"}}]},
			  {"type":{"kode":"DAGL"},"roller":[{"person":{"foedselsnummer":"22222222222"}}]}]`, "22222222222"},
		{"fratrådt hoppes over",
			`[{"type":{"kode":"DAGL"},"roller":[{"person":{"foedselsnummer":"44444444444"},"fratraadt":"J"},
			                                     {"person":{"foedselsnummer":"22222222222"},"fratraadt":"N"}]}]`, "22222222222"},
		{"tom person hoppes over", `[{"type":{"kode":"DAGL"},"roller":[{"person":{},"fritekst":[]}]}]`, ""},
		{"bare styre", `[{"type":{"kode":"STYR"},"roller":[{"person":{"foedselsnummer":"11111111111"}}]}]`, ""},
		{"ingen roller", `[]`, ""},
	}
	for _, tt := range tests {
		if got := dagligLeder(les(tt.grupper)); got != tt.vil {
			t.Errorf("%s: fikk %q, vil ha %q", tt.navn, got, tt.vil)
		}
	}
}

func TestTilVirksomhet(t *testing.T) {
	// Orgnr fra kildedata når id mangler.
	v, ok := tilVirksomhet(tenor.Metadata{Kildedata: `{"organisasjonsnummer":"123456789","navn":"X AS"}`})
	if !ok || v.Organisasjonsnummer != "123456789" || v.Navn != "X AS" || v.DagligLeder != "" {
		t.Errorf("v = %+v, ok = %v", v, ok)
	}
	// Ugyldig kildedata, men gyldig id.
	v, ok = tilVirksomhet(tenor.Metadata{ID: "123456789", Kildedata: "ikke json"})
	if !ok || v.Kildedata != nil || v.Navn != "" {
		t.Errorf("ugyldig kildedata: %+v", v)
	}
	if _, ok := tilVirksomhet(tenor.Metadata{ID: "01010112345"}); ok {
		t.Error("fødselsnummer ble godtatt som orgnr")
	}
}
