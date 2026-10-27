package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"testing"
)

// fregSvar lager et Tenor-svar med personer med løpenummer fra..til-1.
func fregSvar(t *testing.T, treff int64, seed int32, fra, til int) []byte {
	t.Helper()
	docs := []map[string]any{}
	for i := fra; i < til; i++ {
		kilde, _ := json.Marshal(map[string]any{
			"navn": []map[string]any{{"fornavn": "Person", "etternavn": strconv.Itoa(i), "erGjeldende": true}},
		})
		docs = append(docs, map[string]any{
			"tenorMetadata": map[string]any{"id": fmt.Sprintf("%011d", i), "kildedata": string(kilde)},
		})
	}
	b, _ := json.Marshal(map[string]any{"treff": treff, "seed": seed, "dokumentListe": docs})
	return b
}

func TestHentPersonerPaginererMedSeed(t *testing.T) {
	var seeds []string
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		if q.Get("antall") != "200" || q.Get("side") != "0" || q.Get("vis") != "tenorMetadata" {
			t.Errorf("query = %v", q)
		}
		seeds = append(seeds, q.Get("seed"))
		// Første kall har ingen seed; Tenor velger 100. Hver seed gir 200
		// personer som overlapper 50 med forrige seed.
		seed := int32(100)
		if s := q.Get("seed"); s != "" {
			n, _ := strconv.Atoi(s)
			seed = int32(n)
		}
		start := int(seed-100) * 150
		w.Write(fregSvar(t, 1_000_000, seed, start, start+200))
	})

	personer, err := hentPersoner(context.Background(), c, "personstatus:bosatt", 450)
	if err != nil {
		t.Fatal(err)
	}
	if len(personer) != 450 {
		t.Fatalf("fikk %d personer, vil ha 450", len(personer))
	}
	unike := map[string]bool{}
	for _, p := range personer {
		unike[p.Foedselsnummer] = true
	}
	if len(unike) != 450 {
		t.Errorf("fikk %d unike personer", len(unike))
	}
	// 200 + 150 + 150 > 450, så tre kall.
	if fmt.Sprint(seeds) != "[ 101 102]" {
		t.Errorf("seeds = %q", seeds)
	}
}

func TestHentPersonerStopperVedAlleTreff(t *testing.T) {
	kall := 0
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		kall++
		if r.URL.Query().Get("antall") != "10" {
			t.Errorf("antall = %q", r.URL.Query().Get("antall"))
		}
		w.Write(fregSvar(t, 3, 1, 0, 3))
	})
	personer, err := hentPersoner(context.Background(), c, "x:y", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(personer) != 3 || kall != 1 {
		t.Errorf("personer = %d, kall = %d", len(personer), kall)
	}
}

func TestHentPersonerStandardKQL(t *testing.T) {
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql := r.URL.Query().Get("kql")
		if kql == "" || kql[:len(`(personstatus:"bosatt")`)] != `(personstatus:"bosatt")` {
			t.Errorf("kql = %q", kql)
		}
		w.Write(fregSvar(t, 1, 1, 0, 1))
	})
	if _, err := hentPersoner(context.Background(), c, "", 1); err != nil {
		t.Fatal(err)
	}
}

func TestRunPersonerUtskrift(t *testing.T) {
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(fregSvar(t, 2, 1, 1, 3))
	})
	tests := []struct {
		navn string
		opts personerOptions
		vil  string
	}{
		{"fnr", personerOptions{antall: 2}, "00000000001\n00000000002\n"},
		{"navn", personerOptions{antall: 2, navn: true}, "00000000001\tPerson 1\n00000000002\tPerson 2\n"},
	}
	for _, tt := range tests {
		var ut, logg bytes.Buffer
		if err := runPersoner(context.Background(), c, &ut, &logg, &tt.opts); err != nil {
			t.Fatalf("%s: %v", tt.navn, err)
		}
		if ut.String() != tt.vil {
			t.Errorf("%s: ut = %q", tt.navn, ut.String())
		}
	}

	var ut, logg bytes.Buffer
	if err := runPersoner(context.Background(), c, &ut, &logg, &personerOptions{antall: 5, jsonOutput: true}); err != nil {
		t.Fatal(err)
	}
	var personer []map[string]any
	if err := json.Unmarshal(ut.Bytes(), &personer); err != nil {
		t.Fatal(err)
	}
	if len(personer) != 2 || personer[0]["foedselsnummer"] != "00000000001" || personer[0]["kildedata"] == nil {
		t.Errorf("json = %s", ut.String())
	}
	if !strings.Contains(logg.String(), "fant bare 2 av 5") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestTilPerson(t *testing.T) {
	kilde := `{"navn":[
		{"fornavn":"GAMMEL","etternavn":"NAVN","erGjeldende":false},
		{"fornavn":"OLA","mellomnavn":"","etternavn":"NORDMANN","erGjeldende":true}]}`
	p, ok := tilPerson(TenorMetadata{ID: "01010112345", Kildedata: kilde})
	if !ok {
		t.Fatal("ok = false")
	}
	if p.Navn != "OLA NORDMANN" || p.Fornavn != "OLA" || p.Etternavn != "NORDMANN" {
		t.Errorf("person = %+v", p)
	}
	if string(p.Kildedata) != kilde {
		t.Errorf("kildedata = %s", p.Kildedata)
	}

	p, ok = tilPerson(TenorMetadata{ID: "01010112345", Kildedata: `{"navn":[{"fornavn":"KUN","etternavn":"EN"}]}`})
	if !ok || p.Navn != "KUN EN" {
		t.Errorf("uten erGjeldende: %+v", p)
	}

	p, ok = tilPerson(TenorMetadata{ID: "01010112345", Kildedata: "ikke json"})
	if !ok || p.Navn != "" || p.Kildedata != nil {
		t.Errorf("ugyldig kildedata: %+v", p)
	}

	if _, ok := tilPerson(TenorMetadata{ID: "123"}); ok {
		t.Error("ugyldig fødselsnummer ble godtatt")
	}
}
