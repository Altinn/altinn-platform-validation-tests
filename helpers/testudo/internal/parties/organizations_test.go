package parties

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

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register/registertest"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor/tenortest"
)

func TestFetchOrganizations(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/testnorge/v2/soek/brreg-er-fr" {
			t.Errorf("path = %q", r.URL.Path)
		}
		if kql := r.URL.Query().Get("kql"); kql != `organisasjonsform.kode:"AS"` {
			t.Errorf("kql = %q", kql)
		}
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	v, err := fetchOrganizations(context.Background(), c, OrganizationKQL(nil), PersonRole{}, 5)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || v[0].organizationIdentifier != "000000001" || v[0].person != tenortest.LeaderSSN(1) || v[0].kildedata == nil {
		t.Errorf("organizations = %+v", v)
	}
}

func TestFetchOrganizationsRequiresDagligLeder(t *testing.T) {
	var seeds []string
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		seeds = append(seeds, q.Get("seed"))
		// With a filter at least 20 are fetched per call, even though we only
		// want 4.
		if q.Get("antall") != "20" {
			t.Errorf("antall = %q", q.Get("antall"))
		}
		// Each seed gives 3 new organizations: 1 and 2 have a leader, 3 does
		// not.
		seed := int32(10)
		if s := q.Get("seed"); s != "" {
			n, _ := strconv.Atoi(s)
			seed = int32(n)
		}
		start := int(seed-10)*3 + 1
		w.Write(tenortest.BrregResponse(t, 1000, seed, start, start+3))
	})

	v, err := fetchOrganizations(context.Background(), c, OrganizationKQL(nil), PersonRole{}, 4)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 4 {
		t.Fatalf("organizations = %d", len(v))
	}
	for _, x := range v {
		if x.person == "" {
			t.Errorf("organization without daglig leder: %+v", x)
		}
	}
	// 2 with a leader per call, so 2 calls for 4.
	if fmt.Sprint(seeds) != "[ 11]" {
		t.Errorf("seeds = %q", seeds)
	}
}

func TestFetchOrganizationsStopsWhenAllAreSeen(t *testing.T) {
	calls := 0
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		calls++
		// 3 hits in total, only 2 have a daglig leder.
		w.Write(tenortest.BrregResponse(t, 3, 1, 1, 4))
	})
	v, err := fetchOrganizations(context.Background(), c, OrganizationKQL(nil), PersonRole{}, 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || calls != 1 {
		t.Errorf("organizations = %d, calls = %d", len(v), calls)
	}
}

func TestFindOrganizationsRequiresDagligLederInRegister(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := registertest.ReadQuery(t, r)
		want := []string{
			"urn:altinn:organization:identifier-no:000000001", "urn:altinn:person:identifier-no:" + tenortest.LeaderSSN(1),
			"urn:altinn:organization:identifier-no:000000002", "urn:altinn:person:identifier-no:" + tenortest.LeaderSSN(2),
		}
		if fmt.Sprint(urns) != fmt.Sprint(want) {
			t.Errorf("urns = %v", urns)
		}
		// Organization 1 and its leader exist. For organization 2 only the
		// leader exists, so it is not included.
		fmt.Fprintf(w, `{"data":[
			{"partyUuid":"o-1","partyId":601,"organizationIdentifier":"000000001"},
			{"partyUuid":"p-1","partyId":701,"personIdentifier":"%s"},
			{"partyUuid":"p-2","partyId":702,"personIdentifier":"%s"}]}`,
			tenortest.LeaderSSN(1), tenortest.LeaderSSN(2))
	})

	var log bytes.Buffer
	v, err := FindOrganizations(context.Background(), c, reg, OrganizationQuery{Count: 2, Env: "at22"}, &log)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 1 || v[0].OrganizationIdentifier != "000000001" || v[0].PartyUUID != "o-1" || v[0].Kildedata == nil ||
		v[0].PersonRole != "daglig-leder" || v[0].Person.PersonIdentifier != tenortest.LeaderSSN(1) || v[0].Person.PartyID != 701 {
		t.Fatalf("organizations = %+v", v)
	}
	if !strings.Contains(log.String(), "Register (at22): 1 organizations from Tenor, or their person or hovedenhet, do not exist") {
		t.Errorf("log = %q", log.String())
	}
}

func TestFindOrganizationsUnderenheter(t *testing.T) {
	c := tenortest.SubunitClient(t)
	// The default is underenheter of AS, one per hovedenhet. The hovedenhet
	// with two underenheter gives the first one, the AS without a daglig
	// leder none, and the ENK is not in the search.
	v, err := FindOrganizations(context.Background(), c, registertest.Echo(t), OrganizationQuery{Count: 3, Subunits: true}, &bytes.Buffer{})
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 1 || v[0].OrganizationIdentifier != tenortest.SubunitWithLeader {
		t.Fatalf("organizations = %+v", v)
	}
	if u := v[0]; u.Hovedenhet == nil || u.Hovedenhet.OrganizationIdentifier != tenortest.MainUnitWithLeader ||
		u.Person.PersonIdentifier != tenortest.MainUnitLeader || u.PersonRole != "daglig-leder" || u.Kildedata == nil {
		t.Errorf("underenhet = %+v, hovedenhet = %+v", u, u.Hovedenhet)
	}

	// Hovedenheter with at least two underenheter: only the one with a daglig
	// leder.
	v, err = FindOrganizations(context.Background(), c, registertest.Echo(t), OrganizationQuery{Count: 3, Subunits: true, MinSubunits: 2}, &bytes.Buffer{})
	if err != nil || len(v) != 1 || v[0].Hovedenhet == nil || v[0].Hovedenhet.OrganizationIdentifier != tenortest.MainUnitWithLeader {
		t.Fatalf("at least two: organizations = %+v, err = %v", v, err)
	}
	if v, err = FindOrganizations(context.Background(), c, registertest.Echo(t), OrganizationQuery{Count: 3, Subunits: true, MinSubunits: 3}, &bytes.Buffer{}); err != nil || len(v) != 0 {
		t.Fatalf("at least three: organizations = %+v, err = %v", v, err)
	}

	// Without Subunits the hovedenhet itself is fetched.
	v, err = FindOrganizations(context.Background(), c, registertest.Echo(t), OrganizationQuery{Count: 3, MinSubunits: 2}, &bytes.Buffer{})
	if err != nil || len(v) != 1 || v[0].OrganizationIdentifier != tenortest.MainUnitWithLeader || v[0].Hovedenhet != nil {
		t.Fatalf("hovedenheter with at least two: organizations = %+v, err = %v", v, err)
	}

	// Underenheter of ENK.
	v, err = FindOrganizations(context.Background(), c, registertest.Echo(t), OrganizationQuery{Count: 3, Subunits: true, UnitTypes: []string{"enk"}}, &bytes.Buffer{})
	if err != nil || len(v) != 1 || v[0].OrganizationIdentifier != tenortest.SubunitOfENK ||
		v[0].PersonRole != "innehaver" || v[0].Person.PersonIdentifier != tenortest.MainUnitOwner {
		t.Fatalf("of ENK: organizations = %+v, err = %v", v, err)
	}

	// Without Subunits, underenheter are not fetched.
	if kql := OrganizationKQL(nil); strings.Contains(kql, "BEDR") {
		t.Errorf("kql = %q", kql)
	}

	// It also works with --orgno, whatever the organisasjonsform of the
	// hovedenhet.
	v, err = FindOrganizations(context.Background(), c, registertest.Echo(t), OrganizationQuery{OrganizationNumbers: []string{tenortest.SubunitWithLeader2}}, &bytes.Buffer{})
	if err != nil || len(v) != 1 || v[0].Hovedenhet == nil || v[0].Hovedenhet.OrganizationIdentifier != tenortest.MainUnitWithLeader {
		t.Fatalf("with organization number: organizations = %+v, err = %v", v, err)
	}

	// The hovedenhet must exist in Register.
	withoutHovedenhet := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		var data []string
		for _, u := range registertest.ReadQuery(t, r) {
			if !strings.HasSuffix(u, ":"+tenortest.MainUnitWithLeader) {
				data = append(data, `{"partyUuid":"x","personIdentifier":"`+u[strings.LastIndex(u, ":")+1:]+`","organizationIdentifier":"`+u[strings.LastIndex(u, ":")+1:]+`"}`)
			}
		}
		w.Write([]byte(`{"data":[` + strings.Join(data, ",") + `]}`))
	})
	var log bytes.Buffer
	v, err = FindOrganizations(context.Background(), c, withoutHovedenhet, OrganizationQuery{Count: 3, Subunits: true, Env: "at23"}, &log)
	if err != nil || len(v) != 0 || !strings.Contains(log.String(), "1 organizations from Tenor, or their person or hovedenhet, do not exist") {
		t.Errorf("without hovedenhet in Register: organizations = %+v, err = %v, log = %q", v, err, log.String())
	}
}

func TestFindOrganizationsWithPersonRole(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 3, 1, 1, 4))
	})
	// Organization 3 has no daglig leder, but a styreleder, so all three are
	// included.
	v, err := FindOrganizations(context.Background(), c, registertest.Echo(t), OrganizationQuery{Count: 3, PersonRole: "styreleder"}, &bytes.Buffer{})
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 3 || v[2].OrganizationIdentifier != "000000003" || v[2].PersonRole != "styreleder" ||
		v[2].Person.PersonIdentifier != tenortest.ChairSSN(3) {
		t.Fatalf("organizations = %+v", v)
	}

	if _, err := FindOrganizations(context.Background(), c, registertest.Echo(t), OrganizationQuery{Count: 1, PersonRole: "styrekaptein"}, &bytes.Buffer{}); !errors.Is(err, errs.Invalid) {
		t.Errorf("unknown person role: err = %v", err)
	}
}

func TestFindPersonRole(t *testing.T) {
	if r, err := FindPersonRole("styremedlem"); err != nil || r.Code != "MEDL" {
		t.Errorf("r = %+v, err = %v", r, err)
	}
	if _, err := FindPersonRole("MEDL"); !errors.Is(err, errs.Invalid) || !strings.Contains(err.Error(), "daglig-leder, innehaver, styreleder") {
		t.Errorf("err = %v", err)
	}
}

func TestFindOrganizationsWithOrganizationNumbers(t *testing.T) {
	c := tenortest.AuditorClient(t)
	// The revisor without a daglig leder and the organization number that
	// does not exist in Tenor are not included.
	q := OrganizationQuery{Count: 1, OrganizationNumbers: []string{tenortest.AuditorWithLeader2, tenortest.AuditorWithoutLeader, "999999999", tenortest.AuditorWithLeader}}
	v, err := FindOrganizations(context.Background(), c, registertest.Echo(t), q, &bytes.Buffer{})
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || v[0].OrganizationIdentifier != tenortest.AuditorWithLeader2 || v[1].OrganizationIdentifier != tenortest.AuditorWithLeader {
		t.Fatalf("organizations = %+v", v)
	}
}

func TestOrganizationKQL(t *testing.T) {
	for _, tt := range []struct {
		unitTypes []string
		want      string
	}{
		{nil, `organisasjonsform.kode:"AS"`},
		{[]string{"enk"}, `organisasjonsform.kode:"ENK"`},
		{[]string{"ENK", "NUF"}, `organisasjonsform.kode:("ENK" or "NUF")`},
	} {
		if got := OrganizationKQL(tt.unitTypes); got != tt.want {
			t.Errorf("%v: got %q, want %q", tt.unitTypes, got, tt.want)
		}
	}
}

func TestOrganizationQueryKQL(t *testing.T) {
	for _, tt := range []struct {
		q    OrganizationQuery
		want string
	}{
		{OrganizationQuery{}, `organisasjonsform.kode:"AS"`},
		{OrganizationQuery{MinSubunits: 2}, `(organisasjonsform.kode:"AS") AND (antallUnderenheter>=2)`},
		// Hovedenheter must have at least one underenhet.
		{OrganizationQuery{Subunits: true}, `(organisasjonsform.kode:"AS") AND (antallUnderenheter>=1)`},
		{OrganizationQuery{Subunits: true, MinSubunits: 3, UnitTypes: []string{"enk"}}, `(organisasjonsform.kode:"ENK") AND (antallUnderenheter>=3)`},
	} {
		if got := tt.q.KQL(); got != tt.want {
			t.Errorf("%+v: got %q, want %q", tt.q, got, tt.want)
		}
	}
}

func TestFindUnitType(t *testing.T) {
	if code, err := FindUnitType("esek"); err != nil || code != "ESEK" {
		t.Errorf("code = %q, err = %v", code, err)
	}
	if _, err := FindUnitType("SA"); !errors.Is(err, errs.Invalid) || !strings.Contains(err.Error(), "AS, ENK, ESEK, BRL, NUF") {
		t.Errorf("err = %v", err)
	}
}

func TestLeader(t *testing.T) {
	parse := func(s string) []rollegruppe {
		var g []rollegruppe
		if err := json.Unmarshal([]byte(s), &g); err != nil {
			t.Fatal(err)
		}
		return g
	}
	const board = `{"type":{"kode":"STYR"},"roller":[
		{"type":{"kode":"MEDL"},"person":{"foedselsnummer":"11111111111"}},
		{"type":{"kode":"LEDE"},"person":{"foedselsnummer":"55555555555"},"fratraadt":"N"}]}`
	dagl := func(personIdentifier string) string {
		return `{"type":{"kode":"DAGL"},"roller":[{"type":{"kode":"DAGL"},"person":{"foedselsnummer":"` + personIdentifier + `"},"fratraadt":"N"}]}`
	}
	tests := []struct {
		name, unitType, groups, want, code string
	}{
		{"DAGL", "AS", `[` + dagl("22222222222") + `]`, "22222222222", "DAGL"},
		{"INNH", "ENK", `[{"type":{"kode":"INNH"},"roller":[{"type":{"kode":"INNH"},"person":{"foedselsnummer":"33333333333"}}]}]`, "33333333333", "INNH"},
		{"DAGL before INNH", "ENK",
			`[{"type":{"kode":"INNH"},"roller":[{"type":{"kode":"INNH"},"person":{"foedselsnummer":"33333333333"}}]},` + dagl("22222222222") + `]`, "22222222222", "DAGL"},
		{"resigned is skipped", "AS",
			`[{"type":{"kode":"DAGL"},"roller":[{"type":{"kode":"DAGL"},"person":{"foedselsnummer":"44444444444"},"fratraadt":"J"},
			                                     {"type":{"kode":"DAGL"},"person":{"foedselsnummer":"22222222222"},"fratraadt":"N"}]}]`, "22222222222", "DAGL"},
		{"empty person is skipped", "AS", `[{"type":{"kode":"DAGL"},"roller":[{"type":{"kode":"DAGL"},"person":{},"fritekst":[]}]}]`, "", ""},
		{"styreleder in BRL", "BRL", `[` + board + `]`, "55555555555", "LEDE"},
		{"styreleder in ESEK", "ESEK", `[` + board + `]`, "55555555555", "LEDE"},
		{"DAGL before styreleder", "BRL", `[` + board + `,` + dagl("22222222222") + `]`, "22222222222", "DAGL"},
		{"only board in AS", "AS", `[` + board + `]`, "", ""},
		{"no roles", "AS", `[]`, "", ""},
	}
	for _, tt := range tests {
		if personIdentifier, code := leader(tt.unitType, parse(tt.groups)); personIdentifier != tt.want || code != tt.code {
			t.Errorf("%s: got %q (%s), want %q (%s)", tt.name, personIdentifier, code, tt.want, tt.code)
		}
	}

	// With a chosen role the role code is used, whatever the role group.
	if personIdentifier := personWithRole(parse(`[`+board+`]`), "MEDL"); personIdentifier != "11111111111" {
		t.Errorf("styremedlem: %q", personIdentifier)
	}
}

func TestToOrganizationCandidate(t *testing.T) {
	// Organization number from kildedata when the id is missing.
	k, ok := toOrganizationCandidate(tenor.Metadata{Kildedata: `{"organisasjonsnummer":"123456789","navn":"X AS"}`}, PersonRole{})
	if !ok || k.organizationIdentifier != "123456789" || k.person != "" || k.kildedata == nil {
		t.Errorf("k = %+v, ok = %v", k, ok)
	}
	// With a person role the person is the one with the role, and the role
	// gets the name from Access Management.
	source := `{"organisasjonsnummer":"123456789","rollegrupper":[{"type":{"kode":"STYR"},"roller":[{"type":{"kode":"NEST"},"person":{"foedselsnummer":"77777777777"}}]}]}`
	nest, _ := FindPersonRole("nestleder")
	if k, _ := toOrganizationCandidate(tenor.Metadata{Kildedata: source}, nest); k.person != "77777777777" || k.personRole != "nestleder" {
		t.Errorf("nestleder: %+v", k)
	}
	// Invalid kildedata, but a valid id.
	k, ok = toOrganizationCandidate(tenor.Metadata{ID: "123456789", Kildedata: "not json"}, PersonRole{})
	if !ok || k.organizationIdentifier != "123456789" || k.kildedata != nil {
		t.Errorf("invalid kildedata: %+v", k)
	}
	if _, ok := toOrganizationCandidate(tenor.Metadata{ID: "01010112345"}, PersonRole{}); ok {
		t.Error("fødselsnummer was accepted as organization number")
	}

	// Underenhet: the hovedenhet from the role, otherwise from
	// underenhet.hovedenhet, and no person.
	for name, tt := range map[string]struct{ source, want string }{
		"role": {`{"organisasjonsnummer":"800000001","organisasjonsform":{"kode":"AAFY"},"underenhet":{"hovedenhet":"900000009"},
			"rollegrupper":[{"type":{"kode":"AAFY"},"roller":[{"type":{"kode":"AAFY"},"virksomhet":{"organisasjonsnummer":"900000001"}}]}]}`, "900000001"},
		"field only": {`{"organisasjonsnummer":"800000001","organisasjonsform":{"kode":"BEDR"},"underenhet":{"hovedenhet":"900000002"}}`, "900000002"},
		"none":       {`{"organisasjonsnummer":"800000001","organisasjonsform":{"kode":"BEDR"}}`, ""},
	} {
		k, ok := toOrganizationCandidate(tenor.Metadata{Kildedata: tt.source}, PersonRole{})
		if !ok || k.hovedenhet != tt.want || k.person != "" || k.hasPersonOrHovedenhet() != (tt.want != "") {
			t.Errorf("%s: k = %+v", name, k)
		}
	}
}
