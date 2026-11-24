package tenor

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

func testClient(t *testing.T, h http.HandlerFunc) *Client {
	t.Helper()
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	return NewClient(srv.URL, StaticToken("tok"))
}

func TestSearchSendsParamsAndDecodes(t *testing.T) {
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/testnorge/v2/soek/freg" {
			t.Errorf("path = %q", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer tok" {
			t.Errorf("Authorization = %q", got)
		}
		q := r.URL.Query()
		if q.Get("kql") != `personstatus:"bosatt"` || q.Get("antall") != "200" ||
			q.Get("side") != "0" || q.Get("seed") != "3" {
			t.Errorf("query = %v", q)
		}
		if vis := q["vis"]; len(vis) != 2 || vis[0] != "tenorMetadata" || vis[1] != "id" {
			t.Errorf("vis = %v", vis)
		}
		if q.Has("skjul") || q.Has("nokkelinformasjon") {
			t.Errorf("unexpected params: %v", q)
		}
		w.Write([]byte(`{"treff":12345,"rader":1,"offset":0,"nesteSide":1,"seed":3,
			"dokumentListe":[{"tenorMetadata":{"id":"01010112345","kildedata":"{\"navn\":[]}"}}]}`))
	})

	res, err := c.Search(context.Background(), SourceFreg, SearchParams{
		KQL:    Eq(FregPersonstatus, PersonstatusBosatt),
		Antall: Ptr[int32](200),
		Side:   Ptr[int32](0),
		Seed:   Ptr[int32](3),
		Vis:    []string{"tenorMetadata", "id"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if res.Treff != 12345 || res.Seed != 3 || res.NesteSide == nil || *res.NesteSide != 1 {
		t.Errorf("res = %+v", res)
	}
	if len(res.DokumentListe) != 1 {
		t.Fatalf("documents = %d", len(res.DokumentListe))
	}
	md, err := ReadMetadata(res.DokumentListe[0])
	if err != nil {
		t.Fatal(err)
	}
	if md.ID != "01010112345" || md.Kildedata != `{"navn":[]}` {
		t.Errorf("metadata = %+v", md)
	}
}

func TestNesteSideNull(t *testing.T) {
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"treff":1,"nesteSide":null,"dokumentListe":[]}`))
	})
	res, err := c.Search(context.Background(), SourceBrreg, SearchParams{})
	if err != nil {
		t.Fatal(err)
	}
	if res.NesteSide != nil {
		t.Errorf("NesteSide = %v, want nil", *res.NesteSide)
	}
}

func TestExtractAndCount(t *testing.T) {
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/api/testnorge/v2/soek/brreg-er-fr/uthenting":
			if r.URL.Query().Get("kql") != "revisorerOrgnr:*" {
				t.Errorf("kql = %q", r.URL.Query().Get("kql"))
			}
			w.Write([]byte(`{"treff":2,"dokumentListe":[{},{}]}`))
		case "/api/testnorge/v2/soek/brreg-er-fr":
			if r.URL.Query().Get("antall") != "0" {
				t.Errorf("antall = %q", r.URL.Query().Get("antall"))
			}
			w.Write([]byte(`{"treff":42}`))
		default:
			t.Errorf("unexpected path %q", r.URL.Path)
		}
	})

	res, err := c.Extract(context.Background(), SourceBrreg, ExtractParams{KQL: Exists("revisorerOrgnr")})
	if err != nil {
		t.Fatal(err)
	}
	if len(res.DokumentListe) != 2 {
		t.Errorf("documents = %d", len(res.DokumentListe))
	}

	n, err := c.Count(context.Background(), SourceBrreg, "organisasjonsform.kode:AS")
	if err != nil {
		t.Fatal(err)
	}
	if n != 42 {
		t.Errorf("count = %d", n)
	}
}

func TestErrors(t *testing.T) {
	tests := []struct {
		name   string
		status int
		body   string
		want   error
	}{
		{"404", http.StatusNotFound, "", errs.NotFound},
		{"500", http.StatusInternalServerError, "boom", errs.InvalidResponse},
		{"invalid json", http.StatusOK, "not json", errs.InvalidResponse},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(tt.status)
				w.Write([]byte(tt.body))
			})
			_, err := c.Search(context.Background(), SourceFreg, SearchParams{KQL: "x"})
			if !errors.Is(err, tt.want) {
				t.Errorf("err = %v, want %v", err, tt.want)
			}
		})
	}

	c := NewClient(DefaultBaseURL, StaticToken("tok"))
	if _, err := c.Search(context.Background(), "", SearchParams{}); !errors.Is(err, errs.Invalid) {
		t.Errorf("empty source: err = %v", err)
	}
	c.baseURL = "http://127.0.0.1:1"
	if _, err := c.Search(context.Background(), SourceFreg, SearchParams{}); !errors.Is(err, errs.Connection) {
		t.Errorf("no server: err = %v", err)
	}
}

func TestReadMetadataMissing(t *testing.T) {
	if _, err := ReadMetadata([]byte(`{"id":"1"}`)); !errors.Is(err, errs.InvalidResponse) {
		t.Errorf("err = %v", err)
	}
}

func TestKQL(t *testing.T) {
	tests := []struct {
		name, got, want string
	}{
		{"eq", Eq(FregFornavn, `O"Brien`), `fornavn:"O\"Brien"`},
		{"one of", OneOf(FregSivilstand, SivilstandGift, SivilstandSkilt), `sivilstand:("gift" or "skilt")`},
		{"exists", Exists(FregDeltBosted), "deltBosted:*"},
		{"bool", Bool(FregHarRettsligHandleevne, true), "harRettsligHandleevne:true"},
		{"compare", Compare(FregNavnLengde, Greater, "50"), "navnLengde>50"},
		{"open range", Range(FregAntallBarn, "2", ""), "antallBarn:[2 to *]"},
		{"nested", Nested("tenorRelasjoner.arbeidsforhold", Eq("ansettelsesform", "fast")),
			`tenorRelasjoner.arbeidsforhold:{ansettelsesform:"fast"}`},
		{"and skips empty parts", And("a:1", "", "b:2"), "(a:1) AND (b:2)"},
		{"and with one part", And("a:1", " "), "a:1"},
		{"or", Or("a:1", "b:2"), "(a:1) OR (b:2)"},
		{"not", Not(Eq(FregKjoenn, KjoennMann)), `NOT (kjoenn:"mann")`},
	}
	for _, tt := range tests {
		if tt.got != tt.want {
			t.Errorf("%s: got %q, want %q", tt.name, tt.got, tt.want)
		}
	}
}
