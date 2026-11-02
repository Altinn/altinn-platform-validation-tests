package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
)

// brregDok lager et brreg-dokument. leder er daglig leder (tom for ingen), og
// revisor er tilretteleggeren med REVI (tom for ingen).
func brregDok(orgnr, navn, leder, revisor string) map[string]any {
	grupper := []map[string]any{}
	if leder != "" {
		grupper = append(grupper, map[string]any{"type": map[string]string{"kode": "DAGL"},
			"roller": []map[string]any{{"person": map[string]string{"foedselsnummer": leder}, "fratraadt": "N"}}})
	}
	if revisor != "" {
		grupper = append(grupper, map[string]any{"type": map[string]string{"kode": "REVI"},
			"roller": []map[string]any{{"virksomhet": map[string]string{"organisasjonsnummer": revisor}, "fratraadt": "N"}}})
	}
	kilde, _ := json.Marshal(map[string]any{"organisasjonsnummer": orgnr, "navn": navn, "rollegrupper": grupper})
	return map[string]any{"tenorMetadata": map[string]any{"id": orgnr, "kildedata": string(kilde)}}
}

func svar(w io.Writer, treff int, docs ...map[string]any) {
	if docs == nil {
		docs = []map[string]any{}
	}
	json.NewEncoder(w).Encode(map[string]any{"treff": treff, "seed": 1, "dokumentListe": docs})
}

const (
	revisorMedLeder  = "900000001"
	revisorUtenLeder = "900000002"
	revisorMedLeder2 = "900000003"
)

// tilretteleggerServer er en falsk Tenor med tre revisorer, funnet via
// klientene sine: to med daglig leder og én uten.
func tilretteleggerServer(t *testing.T) *TenorClient {
	t.Helper()
	tilrettelegger := map[string]map[string]any{
		revisorMedLeder:  brregDok(revisorMedLeder, "REVISOR EN AS", "10000000001", ""),
		revisorUtenLeder: brregDok(revisorUtenLeder, "REVISOR TO AS", "", ""),
		revisorMedLeder2: brregDok(revisorMedLeder2, "REVISOR TRE AS", "10000000003", ""),
	}
	// Klientene i rekkefølge, så kandidatene blir revisor 1, 2 og 3. Revisor 1
	// har to klienter, for å sjekke at samme revisor bare tas med én gang.
	klienter := []map[string]any{
		brregDok("100000011", "KLIENT 11 AS", "", revisorMedLeder),
		brregDok("100000012", "KLIENT 12 AS", "", revisorMedLeder),
		brregDok("100000021", "KLIENT 21 AS", "", revisorUtenLeder),
		brregDok("100000031", "KLIENT 31 AS", "", revisorMedLeder2),
	}

	return testClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql := r.URL.Query().Get("kql")
		switch {
		case kql == "revisorerOrgnr:*":
			svar(w, len(klienter), klienter...)
		case strings.HasPrefix(kql, "organisasjonsnummer:("):
			var docs []map[string]any
			for _, id := range strings.Split(strings.Trim(strings.TrimPrefix(kql, "organisasjonsnummer:"), "()"), " or ") {
				if d, ok := tilrettelegger[id]; ok {
					docs = append(docs, d)
				}
			}
			svar(w, len(docs), docs...)
		default:
			t.Errorf("uventet kql %q", kql)
		}
	})
}

func TestHentTilretteleggere(t *testing.T) {
	c := tilretteleggerServer(t)
	revisor, _ := finnTilretteleggerRolle("revisor")

	v, err := hentTilretteleggere(context.Background(), c, revisor, 5)
	if err != nil {
		t.Fatal(err)
	}
	// Revisoren uten daglig leder er filtrert bort, og rekkefølgen er beholdt.
	if len(v) != 2 || v[0].Organisasjonsnummer != revisorMedLeder || v[1].Organisasjonsnummer != revisorMedLeder2 {
		t.Fatalf("v = %+v", v)
	}
	if v[0].Rolle != "revisor" || v[0].DagligLeder != "10000000001" || v[0].Navn != "REVISOR EN AS" {
		t.Errorf("første = %+v", v[0])
	}

	v, _ = hentTilretteleggere(context.Background(), c, revisor, 1)
	if len(v) != 1 || v[0].Organisasjonsnummer != revisorMedLeder {
		t.Errorf("med -n 1: %+v", v)
	}
}

func TestTilretteleggerFraKlient(t *testing.T) {
	md := func(grupper string) TenorMetadata {
		return TenorMetadata{Kildedata: `{"rollegrupper":` + grupper + `}`}
	}
	tests := []struct {
		navn, grupper, kode, vil string
	}{
		{"REVI", `[{"type":{"kode":"REVI"},"roller":[{"virksomhet":{"organisasjonsnummer":"123456789"}}]}]`, "REVI", "123456789"},
		{"feil kode", `[{"type":{"kode":"REGN"},"roller":[{"virksomhet":{"organisasjonsnummer":"123456789"}}]}]`, "REVI", ""},
		{"FFØR", `[{"type":{"kode":"FFØR"},"roller":[{"virksomhet":{"organisasjonsnummer":"123456789"}}]}]`, "FFØR", "123456789"},
		{"fratrådt", `[{"type":{"kode":"REVI"},"roller":[{"virksomhet":{"organisasjonsnummer":"111111111"},"fratraadt":"J"},
			{"virksomhet":{"organisasjonsnummer":"123456789"},"fratraadt":"N"}]}]`, "REVI", "123456789"},
		{"tom virksomhet", `[{"type":{"kode":"REVI"},"roller":[{"virksomhet":{}}]}]`, "REVI", ""},
	}
	for _, tt := range tests {
		if got := tilretteleggerFraKlient(md(tt.grupper), tt.kode); got != tt.vil {
			t.Errorf("%s: fikk %q, vil ha %q", tt.navn, got, tt.vil)
		}
	}
}

func TestValiderVirksomhetValg(t *testing.T) {
	tests := []struct {
		navn    string
		opts    virksomheterOptions
		kqlSatt bool
		feil    string
	}{
		{"vanlig", virksomheterOptions{antall: 1}, false, ""},
		{"vanlig med kql", virksomheterOptions{antall: 1}, true, ""},
		{"rolle", virksomheterOptions{antall: 1, rolle: "revisor"}, false, ""},
		{"antall 0", virksomheterOptions{}, false, "--antall"},
		{"ukjent rolle", virksomheterOptions{antall: 1, rolle: "advokat"}, false, "ukjent --rolle"},
		{"rolle og kql", virksomheterOptions{antall: 1, rolle: "revisor"}, true, "kan ikke brukes sammen"},
	}
	for _, tt := range tests {
		err := tt.opts.valider(tt.kqlSatt)
		if tt.feil == "" {
			if err != nil {
				t.Errorf("%s: %v", tt.navn, err)
			}
			continue
		}
		if !errors.Is(err, ErrInvalid) || !strings.Contains(err.Error(), tt.feil) {
			t.Errorf("%s: err = %v", tt.navn, err)
		}
	}
}

func TestRunVirksomheterRolleTekst(t *testing.T) {
	c := tilretteleggerServer(t)
	var ut, logg bytes.Buffer
	opts := &virksomheterOptions{antall: 1, rolle: "revisor"}
	if err := runVirksomheter(context.Background(), c, ekkoRegister(t), &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if vil := revisorMedLeder + "\tREVISOR EN AS\t10000000001\trevisor\n"; ut.String() != vil {
		t.Errorf("ut = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "via klientene (revisorerOrgnr:*)") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestRunVirksomheterRolleCSVOgJSON(t *testing.T) {
	c := tilretteleggerServer(t)
	parter := map[string]string{
		string(OrganisasjonUrn(revisorMedLeder)): `{"partyUuid":"f-1","partyId":801,"organizationIdentifier":"` + revisorMedLeder + `"}`,
		string(PersonUrn("10000000001")):         `{"partyUuid":"d-1","partyId":802,"personIdentifier":"10000000001"}`,
	}
	var antallUrns []int
	reg := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := lesQuery(t, r)
		antallUrns = append(antallUrns, len(urns))
		var data []string
		for _, u := range urns {
			if p, ok := parter[u]; ok {
				data = append(data, p)
			}
		}
		fmt.Fprint(w, `{"data":[`+strings.Join(data, ",")+`]}`)
	})

	var ut, logg bytes.Buffer
	opts := &virksomheterOptions{antall: 1, rolle: "revisor", env: "at23", utskrift: utskriftValg{format: "csv"}}
	if err := runVirksomheter(context.Background(), c, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if vil := "organizationIdentifier,displayName,partyId,partyUuid\n" + revisorMedLeder + ",REVISOR EN AS,801,f-1\n"; ut.String() != vil {
		t.Errorf("csv = %q", ut.String())
	}
	// Tilretteleggeren og daglig leder i samme kall.
	if fmt.Sprint(antallUrns) != "[2]" {
		t.Errorf("urns per kall = %v", antallUrns)
	}

	// type-kolonnen gir rollen.
	ut.Reset()
	opts.utskrift.kolonner = "partyUuid,organizationIdentifier,type"
	if err := runVirksomheter(context.Background(), c, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if ut.String() != "partyUuid,organizationIdentifier,type\nf-1,"+revisorMedLeder+",revisor\n" {
		t.Errorf("csv med type = %q", ut.String())
	}

	// JSON: feltene fra Register på samme nivå, og daglig leder for seg.
	ut.Reset()
	opts.utskrift = utskriftValg{}
	opts.jsonOutput = true
	if err := runVirksomheter(context.Background(), c, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	var rader []map[string]any
	if err := json.Unmarshal(ut.Bytes(), &rader); err != nil {
		t.Fatalf("ikke JSON: %v\n%s", err, ut.String())
	}
	if len(rader) != 1 || rader[0]["rolle"] != "revisor" || rader[0]["partyUuid"] != "f-1" {
		t.Fatalf("json = %s", ut.String())
	}
	if d, ok := rader[0]["dagligLederParty"].(map[string]any); !ok || d["partyUuid"] != "d-1" {
		t.Errorf("dagligLederParty = %v", rader[0]["dagligLederParty"])
	}
	if _, finnes := rader[0]["klienter"]; finnes {
		t.Errorf("klienter skal ikke finnes: %v", rader[0])
	}
}
