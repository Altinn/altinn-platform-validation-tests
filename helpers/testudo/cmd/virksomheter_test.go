package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"testing"
)

// lederFnr er fødselsnummeret til daglig leder i virksomhet i i brregSvar.
func lederFnr(i int) string {
	return fmt.Sprintf("%011d", 50000000000+i)
}

// brregSvar lager et Tenor-svar med virksomheter med løpenummer fra..til-1.
// Virksomheter med løpenummer delelig med 3 har ingen daglig leder.
func brregSvar(t *testing.T, treff int64, seed int32, fra, til int) []byte {
	t.Helper()
	docs := []map[string]any{}
	for i := fra; i < til; i++ {
		orgnr := fmt.Sprintf("%09d", i)
		roller := []map[string]any{
			{"type": map[string]string{"kode": "STYR"},
				"roller": []map[string]any{{"person": map[string]string{"foedselsnummer": "11111111111"}, "fratraadt": "N"}}},
		}
		if i%3 != 0 {
			roller = append(roller, map[string]any{"type": map[string]string{"kode": "DAGL"},
				"roller": []map[string]any{{"person": map[string]string{"foedselsnummer": lederFnr(i)}, "fratraadt": "N"}}})
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
	b, _ := json.Marshal(map[string]any{"treff": treff, "seed": seed, "dokumentListe": docs})
	return b
}

func TestHentVirksomheter(t *testing.T) {
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/testnorge/v2/soek/brreg-er-fr" {
			t.Errorf("path = %q", r.URL.Path)
		}
		if kql := r.URL.Query().Get("kql"); kql != "organisasjonsform.kode:AS" {
			t.Errorf("kql = %q", kql)
		}
		w.Write(brregSvar(t, 2, 1, 1, 3))
	})
	v, err := hentVirksomheter(context.Background(), c, "", 5)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || v[0].Organisasjonsnummer != "000000001" || v[0].Navn != "FIRMA 1 AS" ||
		v[0].Organisasjonsform != "AS" || v[0].DagligLeder != lederFnr(1) || v[0].Kildedata == nil {
		t.Errorf("virksomheter = %+v", v)
	}
}

func TestHentVirksomheterKreverDagligLeder(t *testing.T) {
	var seeds []string
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
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
		w.Write(brregSvar(t, 1000, seed, start, start+3))
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

func TestHentMangeFiltrertStopperNaarAlleErSett(t *testing.T) {
	kall := 0
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		kall++
		// 3 treff totalt, bare 2 har daglig leder.
		w.Write(brregSvar(t, 3, 1, 1, 4))
	})
	v, err := hentVirksomheter(context.Background(), c, "", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || kall != 1 {
		t.Errorf("virksomheter = %d, kall = %d", len(v), kall)
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
	v, ok := tilVirksomhet(TenorMetadata{Kildedata: `{"organisasjonsnummer":"123456789","navn":"X AS"}`})
	if !ok || v.Organisasjonsnummer != "123456789" || v.Navn != "X AS" || v.DagligLeder != "" {
		t.Errorf("v = %+v, ok = %v", v, ok)
	}
	// Ugyldig kildedata, men gyldig id.
	v, ok = tilVirksomhet(TenorMetadata{ID: "123456789", Kildedata: "ikke json"})
	if !ok || v.Kildedata != nil || v.Navn != "" {
		t.Errorf("ugyldig kildedata: %+v", v)
	}
	if _, ok := tilVirksomhet(TenorMetadata{ID: "01010112345"}); ok {
		t.Error("fødselsnummer ble godtatt som orgnr")
	}
}

func TestRunVirksomheterUtskrift(t *testing.T) {
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(brregSvar(t, 2, 1, 1, 3))
	})

	var ut, logg bytes.Buffer
	if err := runVirksomheter(context.Background(), c, nil, &ut, &logg, &virksomheterOptions{antall: 2}); err != nil {
		t.Fatal(err)
	}
	vil := "000000001\tFIRMA 1 AS\t" + lederFnr(1) + "\n000000002\tFIRMA 2 AS\t" + lederFnr(2) + "\n"
	if ut.String() != vil {
		t.Errorf("ut = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "-> 2 virksomheter") {
		t.Errorf("logg = %q", logg.String())
	}

	ut.Reset()
	logg.Reset()
	if err := runVirksomheter(context.Background(), c, nil, &ut, &logg, &virksomheterOptions{antall: 5, jsonOutput: true}); err != nil {
		t.Fatal(err)
	}
	var rader []map[string]any
	if err := json.Unmarshal(ut.Bytes(), &rader); err != nil {
		t.Fatal(err)
	}
	if len(rader) != 2 || rader[0]["organisasjonsnummer"] != "000000001" || rader[0]["dagligLeder"] != lederFnr(1) ||
		rader[0]["kildedata"] == nil {
		t.Errorf("json = %s", ut.String())
	}
	if !strings.Contains(logg.String(), "fant bare 2 av 5") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestRunVirksomheterRegister(t *testing.T) {
	tenor := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(brregSvar(t, 2, 1, 1, 3))
	})
	reg := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := lesQuery(t, r)
		vil := []string{
			"urn:altinn:organization:identifier-no:000000001", "urn:altinn:person:identifier-no:" + lederFnr(1),
			"urn:altinn:organization:identifier-no:000000002", "urn:altinn:person:identifier-no:" + lederFnr(2),
		}
		if fmt.Sprint(urns) != fmt.Sprint(vil) {
			t.Errorf("urns = %v", urns)
		}
		// Virksomhet 1 og lederen til virksomhet 2 finnes.
		fmt.Fprintf(w, `{"data":[
			{"partyUuid":"o-1","partyId":601,"partyType":"organization","organizationIdentifier":"000000001"},
			{"partyUuid":"p-2","partyId":702,"partyType":"person","personIdentifier":"%s","user":{"userId":30002}}]}`, lederFnr(2))
	})

	var ut, logg bytes.Buffer
	err := runVirksomheter(context.Background(), tenor, reg, &ut, &logg, &virksomheterOptions{antall: 2, register: true, env: "at22"})
	if err != nil {
		t.Fatal(err)
	}
	var rader []map[string]any
	if err := json.Unmarshal(ut.Bytes(), &rader); err != nil {
		t.Fatalf("ikke JSON: %v\n%s", err, ut.String())
	}
	foerste, andre := rader[0], rader[1]
	if a, ok := foerste["altinn"].(map[string]any); !ok || a["partyId"] != float64(601) ||
		foerste["dagligLederAltinn"] != nil || foerste["altinnEnvironment"] != "at22" {
		t.Errorf("første = %v", foerste)
	}
	if d, ok := andre["dagligLederAltinn"].(map[string]any); !ok || d["partyId"] != float64(702) || andre["altinn"] != nil {
		t.Errorf("andre = %v", andre)
	}
	if !strings.Contains(logg.String(), "Register (at22): 2 identifikatorer mangler") {
		t.Errorf("logg = %q", logg.String())
	}

	if err := runVirksomheter(context.Background(), tenor, nil, &ut, &logg, &virksomheterOptions{antall: 1, register: true}); !errors.Is(err, ErrInvalid) {
		t.Errorf("uten Register-klient: err = %v", err)
	}
}
