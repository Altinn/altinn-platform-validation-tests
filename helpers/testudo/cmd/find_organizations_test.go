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

func TestRunOrganizationsOutput(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})

	var out, log bytes.Buffer
	if err := runOrganizations(context.Background(), c, registertest.Echo(t), &out, &log, &organizationsOptions{count: 2}); err != nil {
		t.Fatal(err)
	}
	// The name is from Register, not from Tenor (FIRMA 1 AS).
	want := "000000001\tVIRKSOMHET 000000001\t" + tenortest.LeaderSSN(1) + "\n000000002\tVIRKSOMHET 000000002\t" + tenortest.LeaderSSN(2) + "\n"
	if out.String() != want {
		t.Errorf("out = %q", out.String())
	}
	if !strings.Contains(log.String(), "-> 2 organizations") {
		t.Errorf("log = %q", log.String())
	}

	out.Reset()
	log.Reset()
	if err := runOrganizations(context.Background(), c, registertest.Echo(t), &out, &log, &organizationsOptions{count: 5, jsonOutput: true}); err != nil {
		t.Fatal(err)
	}
	var rows []map[string]any
	if err := json.Unmarshal(out.Bytes(), &rows); err != nil {
		t.Fatal(err)
	}
	if len(rows) != 2 || rows[0]["organizationIdentifier"] != "000000001" || rows[0]["unitType"] != "AS" ||
		rows[0]["person"].(map[string]any)["personIdentifier"] != tenortest.LeaderSSN(1) || rows[0]["kildedata"] == nil {
		t.Errorf("json = %s", out.String())
	}
	if !strings.Contains(log.String(), "found only 2 of 5") {
		t.Errorf("log = %q", log.String())
	}
}

func TestRunOrganizationsJSONWithRegister(t *testing.T) {
	tenor := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		registertest.ReadQuery(t, r)
		// Organization 1 and its leader exist. For organization 2 only the
		// leader exists, so it is not included.
		fmt.Fprintf(w, `{"data":[
			{"partyUuid":"o-1","partyId":601,"partyType":"organization","organizationIdentifier":"000000001"},
			{"partyUuid":"p-1","partyId":701,"partyType":"person","personIdentifier":"%s","user":{"userId":30001}},
			{"partyUuid":"p-2","partyId":702,"partyType":"person","personIdentifier":"%s","user":{"userId":30002}}]}`,
			tenortest.LeaderSSN(1), tenortest.LeaderSSN(2))
	})

	var out, log bytes.Buffer
	err := runOrganizations(context.Background(), tenor, reg, &out, &log, &organizationsOptions{count: 2, jsonOutput: true, env: "at22"})
	if err != nil {
		t.Fatal(err)
	}
	var rows []map[string]any
	if err := json.Unmarshal(out.Bytes(), &rows); err != nil {
		t.Fatalf("not JSON: %v\n%s", err, out.String())
	}
	if len(rows) != 1 {
		t.Fatalf("rows = %d", len(rows))
	}
	o := rows[0]
	// The organization from Register is on the same level as kildedata from
	// Tenor.
	if o["organizationIdentifier"] != "000000001" || o["partyId"] != float64(601) || o["partyUuid"] != "o-1" || o["kildedata"] == nil {
		t.Errorf("organization = %v", o)
	}
	// Nothing else from Tenor.
	for _, k := range []string{"organisasjonsnummer", "navn", "organisasjonsform", "dagligLeder", "dagligLederParty", "lederParty"} {
		if _, exists := o[k]; exists {
			t.Errorf("%s should not be present: %v", k, o)
		}
	}
	if p, ok := o["person"].(map[string]any); !ok || p["partyId"] != float64(701) {
		t.Errorf("person = %v", o["person"])
	}
	if !strings.Contains(log.String(), "found only 1 of 2") {
		t.Errorf("log = %q", log.String())
	}

	if err := runOrganizations(context.Background(), tenor, nil, &out, &log, &organizationsOptions{count: 1}); !errors.Is(err, errs.Invalid) {
		t.Errorf("without Register client: err = %v", err)
	}
}

func TestRunOrganizationsCSV(t *testing.T) {
	tenor := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `{"data":[
			{"partyUuid":"o-1","partyId":601,"organizationIdentifier":"000000001","displayName":"FIRMA EN AS"},
			{"partyUuid":"p-1","partyId":701,"personIdentifier":"%s","lastName":"LEDER","user":{"userId":30001}},
			{"partyUuid":"o-2","partyId":602,"organizationIdentifier":"000000002","displayName":"FIRMA TO AS"}]}`, tenortest.LeaderSSN(1))
	})

	var out, log bytes.Buffer
	opts := &organizationsOptions{count: 2, env: "at23", output: outputOptions{format: "csv"}}
	if err := runOrganizations(context.Background(), tenor, reg, &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	// Organization 2 is not included, because its daglig leder does not exist
	// in Register. The name is from Register, not from Tenor (FIRMA 1 AS).
	want := "organizationIdentifier,displayName,partyId,partyUuid\n000000001,FIRMA EN AS,601,o-1\n"
	if out.String() != want {
		t.Errorf("csv = %q", out.String())
	}
	if !strings.Contains(log.String(), "1 organizations from Tenor, or their person or hovedenhet, do not exist") {
		t.Errorf("log = %q", log.String())
	}

	// The whole canonical row.
	out.Reset()
	log.Reset()
	opts.output.columns = "organizationIdentifier,partyId,partyUuid,ssn,userId,userPartyId,userPartyUuid,lastName"
	if err := runOrganizations(context.Background(), tenor, reg, &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	want = "organizationIdentifier,partyId,partyUuid,ssn,userId,userPartyId,userPartyUuid,lastName\n" +
		"000000001,601,o-1," + tenortest.LeaderSSN(1) + ",30001,701,p-1,LEDER\n"
	if out.String() != want {
		t.Errorf("csv = %q", out.String())
	}
}

func TestValidateOrganizationsOptions(t *testing.T) {
	tests := []struct {
		name     string
		opts     organizationsOptions
		countSet bool
		wantErr  string
	}{
		{"default", organizationsOptions{count: 1}, false, ""},
		{"unit types", organizationsOptions{count: 1, unitTypes: []string{"enk", "ESEK", "brl", "nuf"}}, true, ""},
		{"unknown unit type", organizationsOptions{count: 1, unitTypes: []string{"SA"}}, false, "unknown --unit-type"},
		{"orgno", organizationsOptions{count: 10, organizationNumbers: []string{"313490114", "310418672"}}, false, ""},
		{"invalid orgno", organizationsOptions{organizationNumbers: []string{"12345"}}, false, "--orgno"},
		{"orgno and count", organizationsOptions{count: 1, organizationNumbers: []string{"313490114"}}, true, "--count cannot be used with --orgno"},
		{"role", organizationsOptions{count: 1, role: "revisor"}, false, ""},
		{"count 0", organizationsOptions{}, false, "--count"},
		{"unknown role", organizationsOptions{count: 1, role: "advokat"}, false, "unknown --role"},
		{"role and unit type", organizationsOptions{count: 1, role: "revisor", unitTypes: []string{"AS"}}, false, "--role and --unit-type cannot be used together"},
		{"orgno and role", organizationsOptions{role: "revisor", organizationNumbers: []string{"313490114"}}, false, "--orgno and --role cannot be used together"},
		// --person-role can be used with all the others.
		{"person role", organizationsOptions{count: 1, personRole: "styremedlem", unitTypes: []string{"BRL"}}, false, ""},
		{"person role and orgno", organizationsOptions{personRole: "styreleder", organizationNumbers: []string{"313490114"}}, false, ""},
		{"unknown person role", organizationsOptions{count: 1, personRole: "LEDE"}, false, "unknown --person-role"},
		{"subunits", organizationsOptions{count: 1, subunits: true, unitTypes: []string{"ENK"}}, false, ""},
		{"BEDR is not a unit type", organizationsOptions{count: 1, unitTypes: []string{"BEDR"}}, false, "unknown --unit-type"},
		{"subunits and orgno", organizationsOptions{subunits: true, organizationNumbers: []string{"313490114"}}, false, "--subunits cannot be used with --orgno or --role"},
		{"subunits and role", organizationsOptions{count: 1, subunits: true, role: "revisor"}, false, "--subunits cannot be used"},
		{"min subunits", organizationsOptions{count: 1, minSubunits: 2}, false, ""},
		{"min subunits with subunits", organizationsOptions{count: 1, minSubunits: 2, subunits: true, unitTypes: []string{"ENK"}}, false, ""},
		{"negative min subunits", organizationsOptions{count: 1, minSubunits: -1}, false, "--min-subunits cannot be negative"},
		{"min subunits and orgno", organizationsOptions{minSubunits: 2, organizationNumbers: []string{"313490114"}}, false, "--min-subunits cannot be used with --orgno or --role"},
		{"min subunits and role", organizationsOptions{count: 1, minSubunits: 2, role: "revisor"}, false, "--min-subunits cannot be used"},
	}
	for _, tt := range tests {
		err := tt.opts.validate(tt.countSet)
		if tt.wantErr == "" {
			if err != nil {
				t.Errorf("%s: %v", tt.name, err)
			}
			continue
		}
		if !errors.Is(err, errs.Invalid) || !strings.Contains(err.Error(), tt.wantErr) {
			t.Errorf("%s: err = %v", tt.name, err)
		}
	}
}

func TestRunOrganizationsSubunits(t *testing.T) {
	c := tenortest.SubunitClient(t)
	var out, log bytes.Buffer
	opts := &organizationsOptions{count: 1, subunits: true, output: outputOptions{format: "csv",
		columns: "organizationIdentifier,hovedenhetOrganizationIdentifier,hovedenhetPartyUuid,hovedenhetDisplayName,personRole,ssn"}}
	if err := runOrganizations(context.Background(), c, registertest.Echo(t), &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	want := "organizationIdentifier,hovedenhetOrganizationIdentifier,hovedenhetPartyUuid,hovedenhetDisplayName,personRole,ssn\n" +
		tenortest.SubunitWithLeader + "," + tenortest.MainUnitWithLeader + ",o-" + tenortest.MainUnitWithLeader +
		",VIRKSOMHET " + tenortest.MainUnitWithLeader + ",daglig-leder," + tenortest.MainUnitLeader + "\n"
	if out.String() != want {
		t.Errorf("csv = %q", out.String())
	}

	// Text: the hovedenhet last.
	out.Reset()
	opts.output = outputOptions{}
	if err := runOrganizations(context.Background(), c, registertest.Echo(t), &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	if want := tenortest.SubunitWithLeader + "\tVIRKSOMHET " + tenortest.SubunitWithLeader + "\t" + tenortest.MainUnitLeader + "\t" + tenortest.MainUnitWithLeader + "\n"; out.String() != want {
		t.Errorf("text = %q", out.String())
	}
}

func TestRunOrganizationsPersonRole(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 3, 1, 1, 4))
	})
	var out, log bytes.Buffer
	// Organization 3 has no daglig leder, but it has a styreleder.
	opts := &organizationsOptions{count: 3, personRole: "styreleder", output: outputOptions{format: "csv", columns: "organizationIdentifier,personRole,ssn"}}
	if err := runOrganizations(context.Background(), c, registertest.Echo(t), &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(out.String(), "000000003,styreleder,"+tenortest.ChairSSN(3)+"\n") || strings.Count(out.String(), "\n") != 4 {
		t.Errorf("csv = %q", out.String())
	}
	if !strings.Contains(log.String(), "Fetching 3 organizations with styreleder from Tenor") {
		t.Errorf("log = %q", log.String())
	}

	// Without --person-role the person is the leader, and personRole says
	// which role.
	out.Reset()
	opts.personRole = ""
	if err := runOrganizations(context.Background(), c, registertest.Echo(t), &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(out.String(), "000000001,daglig-leder,"+tenortest.LeaderSSN(1)+"\n") {
		t.Errorf("csv without person role = %q", out.String())
	}
}

func TestRunOrganizationsUnitTypes(t *testing.T) {
	var kql string
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql = r.URL.Query().Get("kql")
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	var out, log bytes.Buffer
	opts := &organizationsOptions{count: 2, unitTypes: []string{"enk", "nuf"}}
	if err := runOrganizations(context.Background(), c, registertest.Echo(t), &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	if want := `organisasjonsform.kode:("ENK" or "NUF")`; kql != want || !strings.Contains(log.String(), want) {
		t.Errorf("kql = %q, log = %q", kql, log.String())
	}
}

func TestRunOrganizationsOrganizationNumbers(t *testing.T) {
	c := tenortest.AuditorClient(t)
	var out, log bytes.Buffer
	// The revisor without a daglig leder is not included, so it is 1 of 2.
	opts := &organizationsOptions{count: 10, organizationNumbers: []string{tenortest.AuditorWithoutLeader, tenortest.AuditorWithLeader}}
	if err := runOrganizations(context.Background(), c, registertest.Echo(t), &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	if want := tenortest.AuditorWithLeader + "\tVIRKSOMHET " + tenortest.AuditorWithLeader + "\t10000000001\n"; out.String() != want {
		t.Errorf("out = %q", out.String())
	}
	if !strings.Contains(log.String(), "Fetching 2 organizations with the leader from Tenor: "+tenortest.AuditorWithoutLeader) ||
		!strings.Contains(log.String(), "found only 1 of 2") {
		t.Errorf("log = %q", log.String())
	}
}

func TestRunOrganizationsRoleText(t *testing.T) {
	c := tenortest.AuditorClient(t)
	var out, log bytes.Buffer
	opts := &organizationsOptions{count: 1, role: "revisor"}
	if err := runOrganizations(context.Background(), c, registertest.Echo(t), &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	if want := tenortest.AuditorWithLeader + "\tVIRKSOMHET " + tenortest.AuditorWithLeader + "\t10000000001\trevisor\n"; out.String() != want {
		t.Errorf("out = %q", out.String())
	}
	if !strings.Contains(log.String(), "via the clients (revisorerOrgnr:*)") {
		t.Errorf("log = %q", log.String())
	}
}

func TestRunOrganizationsRoleCSVAndJSON(t *testing.T) {
	c := tenortest.AuditorClient(t)
	partiesByURN := map[string]string{
		string(register.OrganizationURN(tenortest.AuditorWithLeader)): `{"partyUuid":"f-1","partyId":801,"organizationIdentifier":"` + tenortest.AuditorWithLeader + `","displayName":"REVISOR EN AS"}`,
		string(register.PersonURN("10000000001")):                     `{"partyUuid":"d-1","partyId":802,"personIdentifier":"10000000001"}`,
	}
	var urnCounts []int
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := registertest.ReadQuery(t, r)
		urnCounts = append(urnCounts, len(urns))
		var data []string
		for _, u := range urns {
			if p, ok := partiesByURN[u]; ok {
				data = append(data, p)
			}
		}
		fmt.Fprint(w, `{"data":[`+strings.Join(data, ",")+`]}`)
	})

	var out, log bytes.Buffer
	opts := &organizationsOptions{count: 1, role: "revisor", env: "at23", output: outputOptions{format: "csv"}}
	if err := runOrganizations(context.Background(), c, reg, &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	if want := "organizationIdentifier,displayName,partyId,partyUuid\n" + tenortest.AuditorWithLeader + ",REVISOR EN AS,801,f-1\n"; out.String() != want {
		t.Errorf("csv = %q", out.String())
	}
	// The tilrettelegger and the daglig leder in the same call.
	if fmt.Sprint(urnCounts) != "[2]" {
		t.Errorf("urns per call = %v", urnCounts)
	}

	// The type column gives the role.
	out.Reset()
	opts.output.columns = "partyUuid,organizationIdentifier,type"
	if err := runOrganizations(context.Background(), c, reg, &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	if out.String() != "partyUuid,organizationIdentifier,type\nf-1,"+tenortest.AuditorWithLeader+",revisor\n" {
		t.Errorf("csv with type = %q", out.String())
	}

	// JSON: the fields from Register on the same level, and the daglig leder
	// separately.
	out.Reset()
	opts.output = outputOptions{}
	opts.jsonOutput = true
	if err := runOrganizations(context.Background(), c, reg, &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	var rows []map[string]any
	if err := json.Unmarshal(out.Bytes(), &rows); err != nil {
		t.Fatalf("not JSON: %v\n%s", err, out.String())
	}
	if len(rows) != 1 || rows[0]["role"] != "revisor" || rows[0]["partyUuid"] != "f-1" {
		t.Fatalf("json = %s", out.String())
	}
	if p, ok := rows[0]["person"].(map[string]any); !ok || p["partyUuid"] != "d-1" {
		t.Errorf("person = %v", rows[0]["person"])
	}
	if _, exists := rows[0]["klienter"]; exists {
		t.Errorf("klienter should not be present: %v", rows[0])
	}
}
