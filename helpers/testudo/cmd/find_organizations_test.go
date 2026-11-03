package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register/registertest"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor/tenortest"
)

func TestRunVirksomheterUtskrift(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})

	var ut, logg bytes.Buffer
	if err := runVirksomheter(context.Background(), c, registertest.Echo(t), &ut, &logg, &virksomheterOptions{antall: 2}); err != nil {
		t.Fatal(err)
	}
	// Navnet er fra Register, ikke fra Tenor (FIRMA 1 AS).
	vil := "000000001\tVIRKSOMHET 000000001\t" + tenortest.LeaderSSN(1) + "\n000000002\tVIRKSOMHET 000000002\t" + tenortest.LeaderSSN(2) + "\n"
	if ut.String() != vil {
		t.Errorf("ut = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "-> 2 virksomheter") {
		t.Errorf("logg = %q", logg.String())
	}

	ut.Reset()
	logg.Reset()
	if err := runVirksomheter(context.Background(), c, registertest.Echo(t), &ut, &logg, &virksomheterOptions{antall: 5, jsonOutput: true}); err != nil {
		t.Fatal(err)
	}
	var rader []map[string]any
	if err := json.Unmarshal(ut.Bytes(), &rader); err != nil {
		t.Fatal(err)
	}
	if len(rader) != 2 || rader[0]["organizationIdentifier"] != "000000001" || rader[0]["unitType"] != "AS" ||
		rader[0]["person"].(map[string]any)["personIdentifier"] != tenortest.LeaderSSN(1) || rader[0]["kildedata"] == nil {
		t.Errorf("json = %s", ut.String())
	}
	if !strings.Contains(logg.String(), "fant bare 2 av 5") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestRunVirksomheterJSONMedRegister(t *testing.T) {
	tenor := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		registertest.ReadQuery(t, r)
		// Virksomhet 1 og lederen dens finnes. For virksomhet 2 finnes bare
		// lederen, så den blir ikke med.
		fmt.Fprintf(w, `{"data":[
			{"partyUuid":"o-1","partyId":601,"partyType":"organization","organizationIdentifier":"000000001"},
			{"partyUuid":"p-1","partyId":701,"partyType":"person","personIdentifier":"%s","user":{"userId":30001}},
			{"partyUuid":"p-2","partyId":702,"partyType":"person","personIdentifier":"%s","user":{"userId":30002}}]}`,
			tenortest.LeaderSSN(1), tenortest.LeaderSSN(2))
	})

	var ut, logg bytes.Buffer
	err := runVirksomheter(context.Background(), tenor, reg, &ut, &logg, &virksomheterOptions{antall: 2, jsonOutput: true, env: "at22"})
	if err != nil {
		t.Fatal(err)
	}
	var rader []map[string]any
	if err := json.Unmarshal(ut.Bytes(), &rader); err != nil {
		t.Fatalf("ikke JSON: %v\n%s", err, ut.String())
	}
	if len(rader) != 1 {
		t.Fatalf("rader = %d", len(rader))
	}
	v := rader[0]
	// Virksomheten i Register ligger på samme nivå som kildedata fra Tenor.
	if v["organizationIdentifier"] != "000000001" || v["partyId"] != float64(601) || v["partyUuid"] != "o-1" || v["kildedata"] == nil {
		t.Errorf("virksomhet = %v", v)
	}
	// Ingenting annet fra Tenor.
	for _, k := range []string{"organisasjonsnummer", "navn", "organisasjonsform", "dagligLeder", "dagligLederParty", "lederParty"} {
		if _, finnes := v[k]; finnes {
			t.Errorf("%s skal ikke finnes: %v", k, v)
		}
	}
	if d, ok := v["person"].(map[string]any); !ok || d["partyId"] != float64(701) {
		t.Errorf("person = %v", v["person"])
	}
	if !strings.Contains(logg.String(), "fant bare 1 av 2") {
		t.Errorf("logg = %q", logg.String())
	}

	if err := runVirksomheter(context.Background(), tenor, nil, &ut, &logg, &virksomheterOptions{antall: 1}); !errors.Is(err, errs.Invalid) {
		t.Errorf("uten Register-klient: err = %v", err)
	}
}

func TestRunVirksomheterCSV(t *testing.T) {
	tenor := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `{"data":[
			{"partyUuid":"o-1","partyId":601,"organizationIdentifier":"000000001","displayName":"FIRMA EN AS"},
			{"partyUuid":"p-1","partyId":701,"personIdentifier":"%s","lastName":"LEDER","user":{"userId":30001}},
			{"partyUuid":"o-2","partyId":602,"organizationIdentifier":"000000002","displayName":"FIRMA TO AS"}]}`, tenortest.LeaderSSN(1))
	})

	var ut, logg bytes.Buffer
	opts := &virksomheterOptions{antall: 2, env: "at23", utskrift: utskriftValg{format: "csv"}}
	if err := runVirksomheter(context.Background(), tenor, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	// Virksomhet 2 er ikke med, fordi daglig leder ikke finnes i Register.
	// Navnet er fra Register, ikke fra Tenor (FIRMA 1 AS).
	vil := "organizationIdentifier,displayName,partyId,partyUuid\n000000001,FIRMA EN AS,601,o-1\n"
	if ut.String() != vil {
		t.Errorf("csv = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "1 virksomheter fra Tenor, eller personen i dem, finnes ikke") {
		t.Errorf("logg = %q", logg.String())
	}

	// Hele den kanoniske raden.
	ut.Reset()
	logg.Reset()
	opts.utskrift.kolonner = "organizationIdentifier,partyId,partyUuid,ssn,userId,userPartyId,userPartyUuid,lastName"
	if err := runVirksomheter(context.Background(), tenor, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	vil = "organizationIdentifier,partyId,partyUuid,ssn,userId,userPartyId,userPartyUuid,lastName\n" +
		"000000001,601,o-1," + tenortest.LeaderSSN(1) + ",30001,701,p-1,LEDER\n"
	if ut.String() != vil {
		t.Errorf("csv = %q", ut.String())
	}
}

func TestValiderVirksomhetValg(t *testing.T) {
	tests := []struct {
		navn       string
		opts       virksomheterOptions
		antallSatt bool
		feil       string
	}{
		{"vanlig", virksomheterOptions{antall: 1}, false, ""},
		{"organisasjonsformer", virksomheterOptions{antall: 1, organisasjonsformer: []string{"enk", "ESEK", "brl", "nuf"}}, true, ""},
		{"ukjent organisasjonsform", virksomheterOptions{antall: 1, organisasjonsformer: []string{"SA"}}, false, "ukjent --unit-type"},
		{"orgno", virksomheterOptions{antall: 10, orgnr: []string{"313490114", "310418672"}}, false, ""},
		{"ugyldig orgno", virksomheterOptions{orgnr: []string{"12345"}}, false, "--orgno"},
		{"orgno og count", virksomheterOptions{antall: 1, orgnr: []string{"313490114"}}, true, "--count kan ikke brukes med --orgno"},
		{"rolle", virksomheterOptions{antall: 1, rolle: "revisor"}, false, ""},
		{"antall 0", virksomheterOptions{}, false, "--count"},
		{"ukjent rolle", virksomheterOptions{antall: 1, rolle: "advokat"}, false, "ukjent --role"},
		{"rolle og organisasjonsform", virksomheterOptions{antall: 1, rolle: "revisor", organisasjonsformer: []string{"AS"}}, false, "--role og --unit-type kan ikke brukes sammen"},
		{"orgno og rolle", virksomheterOptions{rolle: "revisor", orgnr: []string{"313490114"}}, false, "--orgno og --role kan ikke brukes sammen"},
		// --person-role kan brukes med alle de andre.
		{"personrolle", virksomheterOptions{antall: 1, personrolle: "styremedlem", organisasjonsformer: []string{"BRL"}}, false, ""},
		{"personrolle og orgno", virksomheterOptions{personrolle: "styreleder", orgnr: []string{"313490114"}}, false, ""},
		{"ukjent personrolle", virksomheterOptions{antall: 1, personrolle: "LEDE"}, false, "ukjent --person-role"},
	}
	for _, tt := range tests {
		err := tt.opts.valider(tt.antallSatt)
		if tt.feil == "" {
			if err != nil {
				t.Errorf("%s: %v", tt.navn, err)
			}
			continue
		}
		if !errors.Is(err, errs.Invalid) || !strings.Contains(err.Error(), tt.feil) {
			t.Errorf("%s: err = %v", tt.navn, err)
		}
	}
}

func TestRunVirksomheterPersonrolle(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 3, 1, 1, 4))
	})
	var ut, logg bytes.Buffer
	// Virksomhet 3 har ingen daglig leder, men styreleder.
	opts := &virksomheterOptions{antall: 3, personrolle: "styreleder", utskrift: utskriftValg{format: "csv", kolonner: "organizationIdentifier,personRole,ssn"}}
	if err := runVirksomheter(context.Background(), c, registertest.Echo(t), &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(ut.String(), "000000003,styreleder,"+tenortest.ChairSSN(3)+"\n") || strings.Count(ut.String(), "\n") != 4 {
		t.Errorf("csv = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "Henter 3 virksomheter med styreleder fra Tenor") {
		t.Errorf("logg = %q", logg.String())
	}

	// Uten --person-role er personen lederen, og personRole sier hvilken rolle.
	ut.Reset()
	opts.personrolle = ""
	if err := runVirksomheter(context.Background(), c, registertest.Echo(t), &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(ut.String(), "000000001,daglig-leder,"+tenortest.LeaderSSN(1)+"\n") {
		t.Errorf("csv uten personrolle = %q", ut.String())
	}
}

func TestRunVirksomheterOrganisasjonsformer(t *testing.T) {
	var kql string
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql = r.URL.Query().Get("kql")
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	var ut, logg bytes.Buffer
	opts := &virksomheterOptions{antall: 2, organisasjonsformer: []string{"enk", "nuf"}}
	if err := runVirksomheter(context.Background(), c, registertest.Echo(t), &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if vil := `organisasjonsform.kode:("ENK" or "NUF")`; kql != vil || !strings.Contains(logg.String(), vil) {
		t.Errorf("kql = %q, logg = %q", kql, logg.String())
	}
}

func TestRunVirksomheterOrgnr(t *testing.T) {
	c := tenortest.AuditorClient(t)
	var ut, logg bytes.Buffer
	// Revisoren uten daglig leder blir ikke med, så det blir 1 av 2.
	opts := &virksomheterOptions{antall: 10, orgnr: []string{tenortest.AuditorWithoutLeader, tenortest.AuditorWithLeader}}
	if err := runVirksomheter(context.Background(), c, registertest.Echo(t), &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if vil := tenortest.AuditorWithLeader + "\tVIRKSOMHET " + tenortest.AuditorWithLeader + "\t10000000001\n"; ut.String() != vil {
		t.Errorf("ut = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "Henter 2 virksomheter med lederen fra Tenor: "+tenortest.AuditorWithoutLeader) ||
		!strings.Contains(logg.String(), "fant bare 1 av 2") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestRunVirksomheterRolleTekst(t *testing.T) {
	c := tenortest.AuditorClient(t)
	var ut, logg bytes.Buffer
	opts := &virksomheterOptions{antall: 1, rolle: "revisor"}
	if err := runVirksomheter(context.Background(), c, registertest.Echo(t), &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if vil := tenortest.AuditorWithLeader + "\tVIRKSOMHET " + tenortest.AuditorWithLeader + "\t10000000001\trevisor\n"; ut.String() != vil {
		t.Errorf("ut = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "via klientene (revisorerOrgnr:*)") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestRunVirksomheterRolleCSVOgJSON(t *testing.T) {
	c := tenortest.AuditorClient(t)
	parter := map[string]string{
		string(register.OrganizationURN(tenortest.AuditorWithLeader)): `{"partyUuid":"f-1","partyId":801,"organizationIdentifier":"` + tenortest.AuditorWithLeader + `","displayName":"REVISOR EN AS"}`,
		string(register.PersonURN("10000000001")):                     `{"partyUuid":"d-1","partyId":802,"personIdentifier":"10000000001"}`,
	}
	var antallUrns []int
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := registertest.ReadQuery(t, r)
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
	if vil := "organizationIdentifier,displayName,partyId,partyUuid\n" + tenortest.AuditorWithLeader + ",REVISOR EN AS,801,f-1\n"; ut.String() != vil {
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
	if ut.String() != "partyUuid,organizationIdentifier,type\nf-1,"+tenortest.AuditorWithLeader+",revisor\n" {
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
	if d, ok := rader[0]["person"].(map[string]any); !ok || d["partyUuid"] != "d-1" {
		t.Errorf("person = %v", rader[0]["person"])
	}
	if _, finnes := rader[0]["klienter"]; finnes {
		t.Errorf("klienter skal ikke finnes: %v", rader[0])
	}
}
