package parties

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register/registertest"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor/tenortest"
)

func TestFetchPersonsPaginatesWithSeed(t *testing.T) {
	var seeds []string
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		if q.Get("antall") != "200" || q.Get("side") != "0" || q.Get("vis") != "tenorMetadata" {
			t.Errorf("query = %v", q)
		}
		seeds = append(seeds, q.Get("seed"))
		// The first call has no seed; Tenor picks 100. Each seed gives 200
		// persons that overlap 50 with the previous seed.
		seed := int32(100)
		if s := q.Get("seed"); s != "" {
			n, _ := strconv.Atoi(s)
			seed = int32(n)
		}
		start := int(seed-100) * 150
		w.Write(tenortest.FregResponse(t, 1_000_000, seed, start, start+200))
	})

	persons, err := fetchPersons(context.Background(), c, "personstatus:bosatt", 450)
	if err != nil {
		t.Fatal(err)
	}
	if len(persons) != 450 {
		t.Fatalf("got %d persons, want 450", len(persons))
	}
	unique := map[string]bool{}
	for _, k := range persons {
		unique[k.personIdentifier] = true
	}
	if len(unique) != 450 {
		t.Errorf("got %d unique persons", len(unique))
	}
	// 200 + 150 + 150 > 450, so three calls.
	if fmt.Sprint(seeds) != "[ 101 102]" {
		t.Errorf("seeds = %q", seeds)
	}
}

func TestFetchPersonsStopsAtAllHits(t *testing.T) {
	calls := 0
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		calls++
		if r.URL.Query().Get("antall") != "10" {
			t.Errorf("antall = %q", r.URL.Query().Get("antall"))
		}
		w.Write(tenortest.FregResponse(t, 3, 1, 0, 3))
	})
	persons, err := fetchPersons(context.Background(), c, "x:y", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(persons) != 3 || calls != 1 {
		t.Errorf("persons = %d, calls = %d", len(persons), calls)
	}
}

func TestFetchPersonsDefaultKQL(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql := r.URL.Query().Get("kql")
		if kql == "" || kql[:len(`(personstatus:"bosatt")`)] != `(personstatus:"bosatt")` {
			t.Errorf("kql = %q", kql)
		}
		w.Write(tenortest.FregResponse(t, 1, 1, 0, 1))
	})
	if _, err := fetchPersons(context.Background(), c, "", 1); err != nil {
		t.Fatal(err)
	}
}

func TestDefaultPersonKQL(t *testing.T) {
	now := time.Date(2026, 10, 27, 12, 0, 0, 0, time.UTC)
	if got, want := DefaultPersonKQL(now), `(personstatus:"bosatt") AND (foedselsdato:[* to 2008-10-27])`; got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestFindPersonsReplacesThoseNotInRegister(t *testing.T) {
	calls := 0
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		calls++
		// The first round gives person 1 and 2. Person 2 does not exist in
		// Register, so the next round gives a new one: person 3.
		if calls == 1 {
			w.Write(tenortest.FregResponse(t, 100, 1, 1, 3))
		} else {
			w.Write(tenortest.FregResponse(t, 100, 1, 3, 4))
		}
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		var data []string
		for _, u := range registertest.ReadQuery(t, r) {
			if u != string(register.PersonURN("00000000002")) {
				data = append(data, `{"partyUuid":"u-`+u[len(u)-1:]+`","personIdentifier":"`+u[strings.LastIndex(u, ":")+1:]+`"}`)
			}
		}
		w.Write([]byte(`{"data":[` + strings.Join(data, ",") + `]}`))
	})

	var log bytes.Buffer
	persons, err := FindPersons(context.Background(), c, reg, "x:y", 2, "at23", &log)
	if err != nil {
		t.Fatal(err)
	}
	if len(persons) != 2 || calls != 2 || persons[0].PartyUUID != "u-1" || persons[0].Kildedata == nil ||
		persons[1].PersonIdentifier != "00000000003" {
		t.Fatalf("persons = %+v, calls to Tenor = %d", persons, calls)
	}
	if !strings.Contains(log.String(), "Register (at23): 1 persons from Tenor do not exist and were replaced.") {
		t.Errorf("log = %q", log.String())
	}
}

func TestToPersonCandidate(t *testing.T) {
	source := `{"navn":[{"fornavn":"OLA","etternavn":"NORDMANN","erGjeldende":true}]}`
	k, ok := toPersonCandidate(tenor.Metadata{ID: "01010112345", Kildedata: source})
	if !ok || k.personIdentifier != "01010112345" || string(k.kildedata) != source {
		t.Errorf("k = %+v, ok = %v", k, ok)
	}

	k, ok = toPersonCandidate(tenor.Metadata{ID: "01010112345", Kildedata: "not json"})
	if !ok || k.kildedata != nil {
		t.Errorf("invalid kildedata: %+v", k)
	}

	if _, ok := toPersonCandidate(tenor.Metadata{ID: "123"}); ok {
		t.Error("invalid fødselsnummer was accepted")
	}
}
