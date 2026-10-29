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

// tilretteleggerServer er en falsk Tenor med tre revisorer: to med daglig
// leder og 3 og 2 klienter, og én uten daglig leder.
func tilretteleggerServer(t *testing.T) *TenorClient {
	t.Helper()
	tilrettelegger := map[string]map[string]any{
		revisorMedLeder:  brregDok(revisorMedLeder, "REVISOR EN AS", "10000000001", ""),
		revisorUtenLeder: brregDok(revisorUtenLeder, "REVISOR TO AS", "", ""),
		revisorMedLeder2: brregDok(revisorMedLeder2, "REVISOR TRE AS", "10000000003", ""),
	}
	klienter := map[string][]map[string]any{
		revisorMedLeder: {
			brregDok("100000011", "KLIENT 11 AS", "", revisorMedLeder),
			brregDok("100000012", "KLIENT 12 AS", "", revisorMedLeder),
			brregDok("100000013", "KLIENT 13 AS", "", revisorMedLeder),
		},
		revisorUtenLeder: {brregDok("100000021", "KLIENT 21 AS", "", revisorUtenLeder)},
		revisorMedLeder2: {
			brregDok("100000031", "KLIENT 31 AS", "", revisorMedLeder2),
			brregDok("100000032", "KLIENT 32 AS", "", revisorMedLeder2),
		},
	}

	return testClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql := r.URL.Query().Get("kql")
		antall := r.URL.Query().Get("antall")
		switch {
		case kql == "revisorerOrgnr:*":
			// Klientene i rekkefølge, så kandidatene blir revisor 1, 2 og 3.
			var alle []map[string]any
			for _, f := range []string{revisorMedLeder, revisorUtenLeder, revisorMedLeder2} {
				alle = append(alle, klienter[f]...)
			}
			svar(w, len(alle), alle...)
		case strings.HasPrefix(kql, "organisasjonsnummer:("):
			var docs []map[string]any
			for _, id := range strings.Split(strings.Trim(strings.TrimPrefix(kql, "organisasjonsnummer:"), "()"), " or ") {
				if d, ok := tilrettelegger[id]; ok {
					docs = append(docs, d)
				}
			}
			svar(w, len(docs), docs...)
		case strings.HasPrefix(kql, `revisorerOrgnr:"`):
			orgnr := strings.Trim(strings.TrimPrefix(kql, "revisorerOrgnr:"), `"`)
			if antall == "0" {
				svar(w, len(klienter[orgnr]))
				return
			}
			// Tilretteleggeren selv er med, for å sjekke at den hoppes over.
			svar(w, len(klienter[orgnr])+1, append([]map[string]any{tilrettelegger[orgnr]}, klienter[orgnr]...)...)
		default:
			t.Errorf("uventet kql %q", kql)
		}
	})
}

func TestHentTilretteleggere(t *testing.T) {
	c := tilretteleggerServer(t)
	revisor, _ := finnTilretteleggerRolle("revisor")

	v, err := hentTilretteleggere(context.Background(), c, revisor, 5, 0, io.Discard)
	if err != nil {
		t.Fatal(err)
	}
	// Revisoren uten daglig leder er filtrert bort, og rekkefølgen er beholdt.
	if len(v) != 2 || v[0].Organisasjonsnummer != revisorMedLeder || v[1].Organisasjonsnummer != revisorMedLeder2 {
		t.Fatalf("v = %+v", v)
	}
	if v[0].Rolle != "revisor" || v[0].DagligLeder != "10000000001" || v[0].Navn != "REVISOR EN AS" || v[0].AntallKlienter != 0 {
		t.Errorf("første = %+v", v[0])
	}

	v, _ = hentTilretteleggere(context.Background(), c, revisor, 1, 0, io.Discard)
	if len(v) != 1 || v[0].Organisasjonsnummer != revisorMedLeder {
		t.Errorf("med -n 1: %+v", v)
	}
}

func TestHentTilretteleggereMaksKlienter(t *testing.T) {
	c := tilretteleggerServer(t)
	revisor, _ := finnTilretteleggerRolle("revisor")

	// Begge har høyst 3 klienter: færrest først.
	v, err := hentTilretteleggere(context.Background(), c, revisor, 5, 3, io.Discard)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || v[0].Organisasjonsnummer != revisorMedLeder2 || v[0].AntallKlienter != 2 ||
		v[1].Organisasjonsnummer != revisorMedLeder || v[1].AntallKlienter != 3 {
		t.Errorf("v = %+v", v)
	}

	// Bare den med 2 klienter.
	v, _ = hentTilretteleggere(context.Background(), c, revisor, 5, 2, io.Discard)
	if len(v) != 1 || v[0].Organisasjonsnummer != revisorMedLeder2 {
		t.Errorf("maks 2: %+v", v)
	}

	// Ingen har bare 1 klient.
	_, err = hentTilretteleggere(context.Background(), c, revisor, 5, 1, io.Discard)
	if !errors.Is(err, ErrNotFound) || !strings.Contains(err.Error(), "ingen revisor med 1–1 klienter blant 2 kandidater") {
		t.Errorf("maks 1: err = %v", err)
	}
}

func TestHentKlienter(t *testing.T) {
	c := tilretteleggerServer(t)
	revisor, _ := finnTilretteleggerRolle("revisor")
	k, err := hentKlienter(context.Background(), c, revisor, revisorMedLeder, 5)
	if err != nil {
		t.Fatal(err)
	}
	if len(k) != 3 || k[0].Organisasjonsnummer != "100000011" || k[0].Kildedata != nil {
		t.Errorf("klienter = %+v", k)
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
		{"rolle", virksomheterOptions{antall: 1, rolle: "revisor", klienter: 5, maksKlienter: 10}, false, ""},
		{"antall 0", virksomheterOptions{}, false, "--antall"},
		{"ukjent rolle", virksomheterOptions{antall: 1, rolle: "advokat"}, false, "ukjent --rolle"},
		{"rolle og kql", virksomheterOptions{antall: 1, rolle: "revisor"}, true, "kan ikke brukes sammen"},
		{"klienter uten rolle", virksomheterOptions{antall: 1, klienter: 5}, false, "krever --rolle"},
		{"maks uten rolle", virksomheterOptions{antall: 1, maksKlienter: 5}, false, "krever --rolle"},
		{"for mange klienter", virksomheterOptions{antall: 1, rolle: "revisor", klienter: 201}, false, "mellom 0 og 200"},
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
	opts := &virksomheterOptions{antall: 1, rolle: "revisor", klienter: 2, maksKlienter: 3}
	if err := runVirksomheter(context.Background(), c, nil, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	vil := revisorMedLeder2 + "\tREVISOR TRE AS\t10000000003\trevisor\t2 klienter\n" +
		"  klient\t100000031\tKLIENT 31 AS\n  klient\t100000032\tKLIENT 32 AS\n"
	if ut.String() != vil {
		t.Errorf("ut = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "via klientene (revisorerOrgnr:*)") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestRunVirksomheterRolleRegisterCSVOgJSON(t *testing.T) {
	c := tilretteleggerServer(t)
	// Klient 12 finnes ikke i Register.
	parter := map[string]string{
		string(OrganisasjonUrn(revisorMedLeder)): `{"partyUuid":"f-1","partyId":801,"organizationIdentifier":"` + revisorMedLeder + `"}`,
		string(PersonUrn("10000000001")):         `{"partyUuid":"d-1","partyId":802,"personIdentifier":"10000000001"}`,
		string(OrganisasjonUrn("100000011")):     `{"partyUuid":"k-11","partyId":811,"organizationIdentifier":"100000011"}`,
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
	opts := &virksomheterOptions{antall: 1, rolle: "revisor", klienter: 2, register: true, env: "at23",
		utskrift: utskriftValg{format: "csv"}}
	if err := runVirksomheter(context.Background(), c, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	vil := "organizationIdentifier,displayName,partyId,partyUuid,clientOrganizationIdentifier,clientDisplayName,clientPartyId,clientPartyUuid\n" +
		revisorMedLeder + ",REVISOR EN AS,801,f-1,100000011,KLIENT 11 AS,811,k-11\n"
	if ut.String() != vil {
		t.Errorf("csv = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "Hoppet over 1 rader") {
		t.Errorf("logg = %q", logg.String())
	}
	// Tilretteleggeren, daglig leder og de to klientene i samme kall.
	if fmt.Sprint(antallUrns) != "[4]" {
		t.Errorf("urns per kall = %v", antallUrns)
	}

	// type-kolonnen gir rollen.
	ut.Reset()
	opts.klienter = 0
	opts.utskrift.kolonner = "partyUuid,organizationIdentifier,type"
	if err := runVirksomheter(context.Background(), c, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if ut.String() != "partyUuid,organizationIdentifier,type\nf-1,"+revisorMedLeder+",revisor\n" {
		t.Errorf("csv med type = %q", ut.String())
	}

	// JSON: klientene har altinn, og klienten som mangler har null.
	ut.Reset()
	opts.klienter = 2
	opts.utskrift = utskriftValg{}
	if err := runVirksomheter(context.Background(), c, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	var rader []struct {
		Rolle    string `json:"rolle"`
		Klienter []struct {
			Organisasjonsnummer string          `json:"organisasjonsnummer"`
			Altinn              json.RawMessage `json:"altinn"`
		} `json:"klienter"`
	}
	if err := json.Unmarshal(ut.Bytes(), &rader); err != nil {
		t.Fatalf("ikke JSON: %v\n%s", err, ut.String())
	}
	if len(rader) != 1 || rader[0].Rolle != "revisor" || len(rader[0].Klienter) != 2 ||
		!strings.Contains(string(rader[0].Klienter[0].Altinn), `"k-11"`) || string(rader[0].Klienter[1].Altinn) != "null" {
		t.Errorf("json = %s", ut.String())
	}
}
