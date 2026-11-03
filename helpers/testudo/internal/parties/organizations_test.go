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

func TestHentVirksomheter(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/testnorge/v2/soek/brreg-er-fr" {
			t.Errorf("path = %q", r.URL.Path)
		}
		if kql := r.URL.Query().Get("kql"); kql != `organisasjonsform.kode:"AS"` {
			t.Errorf("kql = %q", kql)
		}
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	v, err := hentVirksomheter(context.Background(), c, OrganizationKQL(nil), 5)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || v[0].organisasjonsnummer != "000000001" || v[0].leder != tenortest.LeaderSSN(1) || v[0].kildedata == nil {
		t.Errorf("virksomheter = %+v", v)
	}
}

func TestHentVirksomheterKreverDagligLeder(t *testing.T) {
	var seeds []string
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		seeds = append(seeds, q.Get("seed"))
		// Med filter hentes minst 20 per kall, selv om vi bare vil ha 4.
		if q.Get("antall") != "20" {
			t.Errorf("antall = %q", q.Get("antall"))
		}
		// Hver seed gir 3 nye virksomheter: 1 og 2 har leder, 3 har ikke.
		seed := int32(10)
		if s := q.Get("seed"); s != "" {
			n, _ := strconv.Atoi(s)
			seed = int32(n)
		}
		start := int(seed-10)*3 + 1
		w.Write(tenortest.BrregResponse(t, 1000, seed, start, start+3))
	})

	v, err := hentVirksomheter(context.Background(), c, OrganizationKQL(nil), 4)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 4 {
		t.Fatalf("virksomheter = %d", len(v))
	}
	for _, x := range v {
		if x.leder == "" {
			t.Errorf("virksomhet uten daglig leder: %+v", x)
		}
	}
	// 2 med leder per kall, så 2 kall for 4.
	if fmt.Sprint(seeds) != "[ 11]" {
		t.Errorf("seeds = %q", seeds)
	}
}

func TestHentVirksomheterStopperNaarAlleErSett(t *testing.T) {
	kall := 0
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kall++
		// 3 treff totalt, bare 2 har daglig leder.
		w.Write(tenortest.BrregResponse(t, 3, 1, 1, 4))
	})
	v, err := hentVirksomheter(context.Background(), c, OrganizationKQL(nil), 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || kall != 1 {
		t.Errorf("virksomheter = %d, kall = %d", len(v), kall)
	}
}

func TestFindOrganizationsKreverDagligLederIRegister(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	reg := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := registertest.ReadQuery(t, r)
		vil := []string{
			"urn:altinn:organization:identifier-no:000000001", "urn:altinn:person:identifier-no:" + tenortest.LeaderSSN(1),
			"urn:altinn:organization:identifier-no:000000002", "urn:altinn:person:identifier-no:" + tenortest.LeaderSSN(2),
		}
		if fmt.Sprint(urns) != fmt.Sprint(vil) {
			t.Errorf("urns = %v", urns)
		}
		// Virksomhet 1 og lederen dens finnes. For virksomhet 2 finnes bare
		// lederen, så den blir ikke med.
		fmt.Fprintf(w, `{"data":[
			{"partyUuid":"o-1","partyId":601,"organizationIdentifier":"000000001"},
			{"partyUuid":"p-1","partyId":701,"personIdentifier":"%s"},
			{"partyUuid":"p-2","partyId":702,"personIdentifier":"%s"}]}`,
			tenortest.LeaderSSN(1), tenortest.LeaderSSN(2))
	})

	var logg bytes.Buffer
	v, err := FindOrganizations(context.Background(), c, reg, OrganizationQuery{Count: 2, Env: "at22"}, &logg)
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 1 || v[0].OrganizationIdentifier != "000000001" || v[0].PartyUUID != "o-1" || v[0].Kildedata == nil ||
		v[0].LederParty.PersonIdentifier != tenortest.LeaderSSN(1) || v[0].LederParty.PartyID != 701 {
		t.Fatalf("virksomheter = %+v", v)
	}
	if !strings.Contains(logg.String(), "Register (at22): 1 virksomheter fra Tenor, eller lederen deres, finnes ikke") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestFindOrganizationsMedOrganisasjonsnummer(t *testing.T) {
	c := tenortest.AuditorClient(t)
	// Revisoren uten daglig leder og orgnr som ikke finnes i Tenor blir ikke med.
	q := OrganizationQuery{Count: 1, OrganizationNumbers: []string{tenortest.AuditorWithLeader2, tenortest.AuditorWithoutLeader, "999999999", tenortest.AuditorWithLeader}}
	v, err := FindOrganizations(context.Background(), c, registertest.Echo(t), q, &bytes.Buffer{})
	if err != nil {
		t.Fatal(err)
	}
	if len(v) != 2 || v[0].OrganizationIdentifier != tenortest.AuditorWithLeader2 || v[1].OrganizationIdentifier != tenortest.AuditorWithLeader {
		t.Fatalf("virksomheter = %+v", v)
	}
}

func TestOrganizationKQL(t *testing.T) {
	for _, tt := range []struct {
		typer []string
		vil   string
	}{
		{nil, `organisasjonsform.kode:"AS"`},
		{[]string{"enk"}, `organisasjonsform.kode:"ENK"`},
		{[]string{"ENK", "NUF"}, `organisasjonsform.kode:("ENK" or "NUF")`},
	} {
		if got := OrganizationKQL(tt.typer); got != tt.vil {
			t.Errorf("%v: fikk %q, vil ha %q", tt.typer, got, tt.vil)
		}
	}
}

func TestFindUnitType(t *testing.T) {
	if kode, err := FindUnitType("esek"); err != nil || kode != "ESEK" {
		t.Errorf("kode = %q, err = %v", kode, err)
	}
	if _, err := FindUnitType("SA"); !errors.Is(err, errs.Invalid) || !strings.Contains(err.Error(), "AS, ENK, ESEK, BRL, NUF") {
		t.Errorf("err = %v", err)
	}
}

func TestLeder(t *testing.T) {
	les := func(s string) []rollegruppe {
		var g []rollegruppe
		if err := json.Unmarshal([]byte(s), &g); err != nil {
			t.Fatal(err)
		}
		return g
	}
	const styre = `{"type":{"kode":"STYR"},"roller":[
		{"type":{"kode":"MEDL"},"person":{"foedselsnummer":"11111111111"}},
		{"type":{"kode":"LEDE"},"person":{"foedselsnummer":"55555555555"},"fratraadt":"N"}]}`
	tests := []struct {
		navn, form, grupper, vil string
	}{
		{"DAGL", "AS", `[{"type":{"kode":"DAGL"},"roller":[{"person":{"foedselsnummer":"22222222222"},"fratraadt":"N"}]}]`, "22222222222"},
		{"INNH", "ENK", `[{"type":{"kode":"INNH"},"roller":[{"person":{"foedselsnummer":"33333333333"}}]}]`, "33333333333"},
		{"DAGL går foran INNH", "ENK",
			`[{"type":{"kode":"INNH"},"roller":[{"person":{"foedselsnummer":"33333333333"}}]},
			  {"type":{"kode":"DAGL"},"roller":[{"person":{"foedselsnummer":"22222222222"}}]}]`, "22222222222"},
		{"fratrådt hoppes over", "AS",
			`[{"type":{"kode":"DAGL"},"roller":[{"person":{"foedselsnummer":"44444444444"},"fratraadt":"J"},
			                                     {"person":{"foedselsnummer":"22222222222"},"fratraadt":"N"}]}]`, "22222222222"},
		{"tom person hoppes over", "AS", `[{"type":{"kode":"DAGL"},"roller":[{"person":{},"fritekst":[]}]}]`, ""},
		{"styreleder i borettslag", "BRL", `[` + styre + `]`, "55555555555"},
		{"styreleder i eierseksjonssameie", "ESEK", `[` + styre + `]`, "55555555555"},
		{"DAGL går foran styreleder", "BRL", `[` + styre + `,{"type":{"kode":"DAGL"},"roller":[{"person":{"foedselsnummer":"22222222222"}}]}]`, "22222222222"},
		{"bare styre i AS", "AS", `[` + styre + `]`, ""},
		{"ingen roller", "AS", `[]`, ""},
	}
	for _, tt := range tests {
		if got := leder(tt.form, les(tt.grupper)); got != tt.vil {
			t.Errorf("%s: fikk %q, vil ha %q", tt.navn, got, tt.vil)
		}
	}
}

func TestTilVirksomhetKandidat(t *testing.T) {
	// Orgnr fra kildedata når id mangler.
	k, ok := tilVirksomhetKandidat(tenor.Metadata{Kildedata: `{"organisasjonsnummer":"123456789","navn":"X AS"}`})
	if !ok || k.organisasjonsnummer != "123456789" || k.leder != "" || k.kildedata == nil {
		t.Errorf("k = %+v, ok = %v", k, ok)
	}
	// Ugyldig kildedata, men gyldig id.
	k, ok = tilVirksomhetKandidat(tenor.Metadata{ID: "123456789", Kildedata: "ikke json"})
	if !ok || k.organisasjonsnummer != "123456789" || k.kildedata != nil {
		t.Errorf("ugyldig kildedata: %+v", k)
	}
	if _, ok := tilVirksomhetKandidat(tenor.Metadata{ID: "01010112345"}); ok {
		t.Error("fødselsnummer ble godtatt som orgnr")
	}
}
