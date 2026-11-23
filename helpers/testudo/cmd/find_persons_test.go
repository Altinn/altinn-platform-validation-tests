package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register/registertest"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor/tenortest"
)

func TestRunPersonsOutput(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.FregResponse(t, 2, 1, 1, 3))
	})
	tests := []struct {
		name string
		opts personsOptions
		want string
	}{
		{"identifier", personsOptions{count: 2}, "00000000001\n00000000002\n"},
		// The name is from Register.
		{"name", personsOptions{count: 2, name: true}, "00000000001\tPERSON 00000000001\n00000000002\tPERSON 00000000002\n"},
	}
	for _, tt := range tests {
		var out, log bytes.Buffer
		if err := runPersons(context.Background(), c, registertest.Echo(t), &out, &log, &tt.opts); err != nil {
			t.Fatalf("%s: %v", tt.name, err)
		}
		if out.String() != tt.want {
			t.Errorf("%s: out = %q", tt.name, out.String())
		}
	}

	var out, log bytes.Buffer
	if err := runPersons(context.Background(), c, registertest.Echo(t), &out, &log, &personsOptions{count: 5, jsonOutput: true}); err != nil {
		t.Fatal(err)
	}
	var persons []map[string]any
	if err := json.Unmarshal(out.Bytes(), &persons); err != nil {
		t.Fatal(err)
	}
	if len(persons) != 2 || persons[0]["personIdentifier"] != "00000000001" || persons[0]["kildedata"] == nil {
		t.Errorf("json = %s", out.String())
	}
	if !strings.Contains(log.String(), "found only 2 of 5") {
		t.Errorf("log = %q", log.String())
	}
}

func TestRunPersonsJSONWithRegister(t *testing.T) {
	tenor := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.FregResponse(t, 100, 1, 1, 3))
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("fields") != "party,person,org,user" {
			t.Errorf("fields = %q", r.URL.Query().Get("fields"))
		}
		var data []string
		for _, u := range registertest.ReadQuery(t, r) {
			switch u {
			case string(register.PersonURN("00000000001")):
				data = append(data, `{"partyUuid":"u-1","partyId":501,"partyType":"person","personIdentifier":"00000000001","user":{"userId":20001}}`)
			case string(register.PersonURN("00000000002")):
				data = append(data, `{"partyUuid":"u-2","partyId":502,"partyType":"person","personIdentifier":"00000000002","user":{"userId":20002}}`)
			}
		}
		w.Write([]byte(`{"data":[` + strings.Join(data, ",") + `]}`))
	})

	var out, log bytes.Buffer
	err := runPersons(context.Background(), tenor, reg, &out, &log, &personsOptions{count: 2, jsonOutput: true, env: "at23"})
	if err != nil {
		t.Fatal(err)
	}

	var rows []map[string]any
	if err := json.Unmarshal(out.Bytes(), &rows); err != nil {
		t.Fatalf("not JSON: %v\n%s", err, out.String())
	}
	if len(rows) != 2 {
		t.Fatalf("rows = %d", len(rows))
	}
	// The fields from Register are on the same level as kildedata from Tenor.
	first := rows[0]
	if first["personIdentifier"] != "00000000001" || first["kildedata"] == nil ||
		first["partyId"] != float64(501) || first["partyUuid"] != "u-1" ||
		first["user"].(map[string]any)["userId"] != float64(20001) {
		t.Errorf("first = %v", first)
	}
	// Nothing else from Tenor.
	for _, k := range []string{"foedselsnummer", "fornavn", "etternavn", "navn", "altinn"} {
		if _, exists := first[k]; exists {
			t.Errorf("%s should not be present: %v", k, first)
		}
	}
}

func TestRunPersonsNoneInRegister(t *testing.T) {
	tenor := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.FregResponse(t, 2, 1, 1, 3))
	})
	err := runPersons(context.Background(), tenor, registertest.Empty(t), &bytes.Buffer{}, &bytes.Buffer{}, &personsOptions{count: 2, env: "at23"})
	if !errors.Is(err, errs.NotFound) || !strings.Contains(err.Error(), "exist in Register for at23") {
		t.Errorf("err = %v", err)
	}
}

func TestRunPersonsWithoutRegisterClient(t *testing.T) {
	err := runPersons(context.Background(), nil, nil, &bytes.Buffer{}, &bytes.Buffer{}, &personsOptions{count: 1})
	if !errors.Is(err, errs.Invalid) {
		t.Errorf("err = %v", err)
	}
}

func TestRunPersonsCSV(t *testing.T) {
	tenor := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.FregResponse(t, 3, 1, 1, 4))
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		// Person 1 is complete, person 2 has no user, person 3 does not exist.
		w.Write([]byte(`{"data":[
			{"partyUuid":"u-1","partyId":501,"personIdentifier":"00000000001","lastName":"NORDMANN","user":{"userId":20001}},
			{"partyUuid":"u-2","partyId":502,"personIdentifier":"00000000002"}]}`))
	})

	var out, log bytes.Buffer
	opts := &personsOptions{count: 3, env: "at23", output: outputOptions{format: "csv"}}
	if err := runPersons(context.Background(), tenor, reg, &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	if out.String() != "personIdentifier,userId,partyId,partyUuid\n00000000001,20001,501,u-1\n" {
		t.Errorf("csv = %q", out.String())
	}
	// Person 3 was replaced because it does not exist in Register, and person 2
	// was skipped in CSV because it has no user.
	if !strings.Contains(log.String(), "1 persons from Tenor do not exist") ||
		!strings.Contains(log.String(), "Skipped 1 persons") {
		t.Errorf("log = %q", log.String())
	}

	// The names are from Register, not from Tenor (Person 1).
	out.Reset()
	opts = &personsOptions{count: 3, output: outputOptions{format: "csv", columns: "personIdentifier,firstName,lastName"}}
	if err := runPersons(context.Background(), tenor, registertest.Echo(t), &out, &log, opts); err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(out.String(), "personIdentifier,firstName,lastName\n00000000001,PERSON,00000000001\n") {
		t.Errorf("csv = %q", out.String())
	}
}
