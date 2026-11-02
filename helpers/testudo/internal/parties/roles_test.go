package parties

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor/tenortest"
)

func TestHentTilretteleggere(t *testing.T) {
	c := tenortest.AuditorClient(t)
	revisor, _ := FindRole("revisor")

	v, err := hentTilretteleggere(context.Background(), c, revisor, 5)
	if err != nil {
		t.Fatal(err)
	}
	// Revisoren uten daglig leder er filtrert bort, og rekkefølgen er beholdt.
	if len(v) != 2 || v[0].Organisasjonsnummer != tenortest.AuditorWithLeader || v[1].Organisasjonsnummer != tenortest.AuditorWithLeader2 {
		t.Fatalf("v = %+v", v)
	}
	if v[0].Rolle != "revisor" || v[0].DagligLeder != "10000000001" || v[0].Navn != "REVISOR EN AS" {
		t.Errorf("første = %+v", v[0])
	}

	v, _ = hentTilretteleggere(context.Background(), c, revisor, 1)
	if len(v) != 1 || v[0].Organisasjonsnummer != tenortest.AuditorWithLeader {
		t.Errorf("med antall 1: %+v", v)
	}
}

func TestFindRole(t *testing.T) {
	if r, err := FindRole("regnskapsfoerer"); err != nil || r.Code != "REGN" || r.Field != "regnskapsfoerereOrgnr" {
		t.Errorf("r = %+v, err = %v", r, err)
	}
	if _, err := FindRole("advokat"); !errors.Is(err, errs.Invalid) || !strings.Contains(err.Error(), "revisor, regnskapsfoerer, forretningsfoerer") {
		t.Errorf("err = %v", err)
	}
}

func TestTilretteleggerFraKlient(t *testing.T) {
	md := func(grupper string) tenor.Metadata {
		return tenor.Metadata{Kildedata: `{"rollegrupper":` + grupper + `}`}
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
