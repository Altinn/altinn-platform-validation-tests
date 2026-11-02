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
	vil := "000000001\tFIRMA 1 AS\t" + tenortest.LeaderSSN(1) + "\n000000002\tFIRMA 2 AS\t" + tenortest.LeaderSSN(2) + "\n"
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
	if len(rader) != 2 || rader[0]["organisasjonsnummer"] != "000000001" || rader[0]["dagligLeder"] != tenortest.LeaderSSN(1) ||
		rader[0]["kildedata"] == nil {
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
	// Virksomheten i Register ligger på samme nivå som feltene fra Tenor.
	if v["organisasjonsnummer"] != "000000001" || v["partyId"] != float64(601) || v["partyUuid"] != "o-1" {
		t.Errorf("virksomhet = %v", v)
	}
	if d, ok := v["dagligLederParty"].(map[string]any); !ok || d["partyId"] != float64(701) {
		t.Errorf("dagligLederParty = %v", v["dagligLederParty"])
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
			{"partyUuid":"o-1","partyId":601,"organizationIdentifier":"000000001"},
			{"partyUuid":"p-1","partyId":701,"personIdentifier":"%s","lastName":"LEDER","user":{"userId":30001}},
			{"partyUuid":"o-2","partyId":602,"organizationIdentifier":"000000002"}]}`, tenortest.LeaderSSN(1))
	})

	var ut, logg bytes.Buffer
	opts := &virksomheterOptions{antall: 2, env: "at23", utskrift: utskriftValg{format: "csv"}}
	if err := runVirksomheter(context.Background(), tenor, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	// Virksomhet 2 er ikke med, fordi daglig leder ikke finnes i Register.
	vil := "organizationIdentifier,displayName,partyId,partyUuid\n000000001,FIRMA 1 AS,601,o-1\n"
	if ut.String() != vil {
		t.Errorf("csv = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "1 virksomheter fra Tenor, eller daglig leder for dem, finnes ikke") {
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
		navn    string
		opts    virksomheterOptions
		kqlSatt bool
		feil    string
	}{
		{"vanlig", virksomheterOptions{antall: 1}, false, ""},
		{"vanlig med kql", virksomheterOptions{antall: 1}, true, ""},
		{"rolle", virksomheterOptions{antall: 1, rolle: "revisor"}, false, ""},
		{"antall 0", virksomheterOptions{}, false, "--count"},
		{"ukjent rolle", virksomheterOptions{antall: 1, rolle: "advokat"}, false, "ukjent --role"},
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
		if !errors.Is(err, errs.Invalid) || !strings.Contains(err.Error(), tt.feil) {
			t.Errorf("%s: err = %v", tt.navn, err)
		}
	}
}

func TestRunVirksomheterRolleTekst(t *testing.T) {
	c := tenortest.AuditorClient(t)
	var ut, logg bytes.Buffer
	opts := &virksomheterOptions{antall: 1, rolle: "revisor"}
	if err := runVirksomheter(context.Background(), c, registertest.Echo(t), &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if vil := tenortest.AuditorWithLeader + "\tREVISOR EN AS\t10000000001\trevisor\n"; ut.String() != vil {
		t.Errorf("ut = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "via klientene (revisorerOrgnr:*)") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestRunVirksomheterRolleCSVOgJSON(t *testing.T) {
	c := tenortest.AuditorClient(t)
	parter := map[string]string{
		string(register.OrganizationURN(tenortest.AuditorWithLeader)): `{"partyUuid":"f-1","partyId":801,"organizationIdentifier":"` + tenortest.AuditorWithLeader + `"}`,
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
	if d, ok := rader[0]["dagligLederParty"].(map[string]any); !ok || d["partyUuid"] != "d-1" {
		t.Errorf("dagligLederParty = %v", rader[0]["dagligLederParty"])
	}
	if _, finnes := rader[0]["klienter"]; finnes {
		t.Errorf("klienter skal ikke finnes: %v", rader[0])
	}
}
