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

func TestFetchTilretteleggere(t *testing.T) {
	c := tenortest.AuditorClient(t)
	revisor, _ := FindRole("revisor")

	v, err := fetchTilretteleggere(context.Background(), c, revisor, PersonRole{}, 5)
	if err != nil {
		t.Fatal(err)
	}
	// The revisor without a daglig leder is filtered out, and the order is
	// kept.
	if len(v) != 2 || v[0].organizationIdentifier != tenortest.AuditorWithLeader || v[1].organizationIdentifier != tenortest.AuditorWithLeader2 {
		t.Fatalf("v = %+v", v)
	}
	if v[0].role != "revisor" || v[0].person != "10000000001" {
		t.Errorf("first = %+v", v[0])
	}

	v, _ = fetchTilretteleggere(context.Background(), c, revisor, PersonRole{}, 1)
	if len(v) != 1 || v[0].organizationIdentifier != tenortest.AuditorWithLeader {
		t.Errorf("with count 1: %+v", v)
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

func TestTilretteleggerFromClient(t *testing.T) {
	md := func(groups string) tenor.Metadata {
		return tenor.Metadata{Kildedata: `{"rollegrupper":` + groups + `}`}
	}
	tests := []struct {
		name, groups, code, want string
	}{
		{"REVI", `[{"type":{"kode":"REVI"},"roller":[{"virksomhet":{"organisasjonsnummer":"123456789"}}]}]`, "REVI", "123456789"},
		{"wrong code", `[{"type":{"kode":"REGN"},"roller":[{"virksomhet":{"organisasjonsnummer":"123456789"}}]}]`, "REVI", ""},
		{"FFØR", `[{"type":{"kode":"FFØR"},"roller":[{"virksomhet":{"organisasjonsnummer":"123456789"}}]}]`, "FFØR", "123456789"},
		{"resigned", `[{"type":{"kode":"REVI"},"roller":[{"virksomhet":{"organisasjonsnummer":"111111111"},"fratraadt":"J"},
			{"virksomhet":{"organisasjonsnummer":"123456789"},"fratraadt":"N"}]}]`, "REVI", "123456789"},
		{"empty organization", `[{"type":{"kode":"REVI"},"roller":[{"virksomhet":{}}]}]`, "REVI", ""},
	}
	for _, tt := range tests {
		if got := tilretteleggerFromClient(md(tt.groups), tt.code); got != tt.want {
			t.Errorf("%s: got %q, want %q", tt.name, got, tt.want)
		}
	}
}
