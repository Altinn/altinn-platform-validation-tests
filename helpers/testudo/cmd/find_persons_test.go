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

func TestRunPersonerUtskrift(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.FregResponse(t, 2, 1, 1, 3))
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
		if err := runPersoner(context.Background(), c, registertest.Echo(t), &ut, &logg, &tt.opts); err != nil {
			t.Fatalf("%s: %v", tt.navn, err)
		}
		if ut.String() != tt.vil {
			t.Errorf("%s: ut = %q", tt.navn, ut.String())
		}
	}

	var ut, logg bytes.Buffer
	if err := runPersoner(context.Background(), c, registertest.Echo(t), &ut, &logg, &personerOptions{antall: 5, jsonOutput: true}); err != nil {
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

func TestRunPersonerJSONMedRegister(t *testing.T) {
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

	var ut, logg bytes.Buffer
	err := runPersoner(context.Background(), tenor, reg, &ut, &logg, &personerOptions{antall: 2, jsonOutput: true, env: "at23"})
	if err != nil {
		t.Fatal(err)
	}

	var rader []map[string]any
	if err := json.Unmarshal(ut.Bytes(), &rader); err != nil {
		t.Fatalf("ikke JSON: %v\n%s", err, ut.String())
	}
	if len(rader) != 2 {
		t.Fatalf("rader = %d", len(rader))
	}
	// Feltene fra Tenor og Register ligger på samme nivå.
	foerste := rader[0]
	if foerste["foedselsnummer"] != "00000000001" || foerste["navn"] != "Person 1" || foerste["kildedata"] == nil ||
		foerste["partyId"] != float64(501) || foerste["partyUuid"] != "u-1" ||
		foerste["user"].(map[string]any)["userId"] != float64(20001) {
		t.Errorf("første = %v", foerste)
	}
	if _, finnes := foerste["altinn"]; finnes {
		t.Errorf("altinn skal ikke finnes lenger: %v", foerste)
	}
}

func TestRunPersonerIngenIRegister(t *testing.T) {
	tenor := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.FregResponse(t, 2, 1, 1, 3))
	})
	err := runPersoner(context.Background(), tenor, registertest.Empty(t), &bytes.Buffer{}, &bytes.Buffer{}, &personerOptions{antall: 2, env: "at23"})
	if !errors.Is(err, errs.NotFound) || !strings.Contains(err.Error(), "finnes i Register for at23") {
		t.Errorf("err = %v", err)
	}
}

func TestRunPersonerUtenRegisterKlient(t *testing.T) {
	err := runPersoner(context.Background(), nil, nil, &bytes.Buffer{}, &bytes.Buffer{}, &personerOptions{antall: 1})
	if !errors.Is(err, errs.Invalid) {
		t.Errorf("err = %v", err)
	}
}

func TestRunPersonerCSV(t *testing.T) {
	tenor := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.FregResponse(t, 3, 1, 1, 4))
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		// Person 1 er komplett, person 2 mangler bruker, person 3 finnes ikke.
		w.Write([]byte(`{"data":[
			{"partyUuid":"u-1","partyId":501,"personIdentifier":"00000000001","lastName":"NORDMANN","user":{"userId":20001}},
			{"partyUuid":"u-2","partyId":502,"personIdentifier":"00000000002"}]}`))
	})

	var ut, logg bytes.Buffer
	opts := &personerOptions{antall: 3, env: "at23", utskrift: utskriftValg{format: "csv"}}
	if err := runPersoner(context.Background(), tenor, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if ut.String() != "personIdentifier,userId,partyId,partyUuid\n00000000001,20001,501,u-1\n" {
		t.Errorf("csv = %q", ut.String())
	}
	// Person 3 er byttet ut fordi den ikke finnes i Register, og person 2 er
	// hoppet over i CSV fordi den mangler bruker.
	if !strings.Contains(logg.String(), "1 personer fra Tenor finnes ikke") ||
		!strings.Contains(logg.String(), "Hoppet over 1 personer") {
		t.Errorf("logg = %q", logg.String())
	}

	// Uten navn i Register brukes navnet fra Tenor.
	ut.Reset()
	opts = &personerOptions{antall: 3, utskrift: utskriftValg{format: "csv", kolonner: "personIdentifier,firstName,lastName"}}
	if err := runPersoner(context.Background(), tenor, registertest.Echo(t), &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(ut.String(), "personIdentifier,firstName,lastName\n00000000001,Person,1\n") {
		t.Errorf("csv = %q", ut.String())
	}
}
