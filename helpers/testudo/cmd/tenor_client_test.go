package cmd

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func testClient(t *testing.T, h http.HandlerFunc) *TenorClient {
	t.Helper()
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	c := NewTenorClient(StaticToken("tok"))
	c.baseURL = srv.URL
	return c
}

func TestSoekSenderParametreOgDekoder(t *testing.T) {
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
			t.Errorf("uventede parametre: %v", q)
		}
		w.Write([]byte(`{"treff":12345,"rader":1,"offset":0,"nesteSide":1,"seed":3,
			"dokumentListe":[{"tenorMetadata":{"id":"01010112345","kildedata":"{\"navn\":[]}"}}]}`))
	})

	res, err := c.Soek(context.Background(), KildeFreg, SoekParams{
		KQL:    Er(FregPersonstatus, PersonstatusBosatt),
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
		t.Fatalf("dokumenter = %d", len(res.DokumentListe))
	}
	md, err := LesTenorMetadata(res.DokumentListe[0])
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
	res, err := c.Soek(context.Background(), KildeBrreg, SoekParams{})
	if err != nil {
		t.Fatal(err)
	}
	if res.NesteSide != nil {
		t.Errorf("NesteSide = %v, vil ha nil", *res.NesteSide)
	}
}

func TestUthentingOgTell(t *testing.T) {
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
			t.Errorf("uventet path %q", r.URL.Path)
		}
	})

	res, err := c.Uthenting(context.Background(), KildeBrreg, UthentingParams{KQL: Finnes("revisorerOrgnr")})
	if err != nil {
		t.Fatal(err)
	}
	if len(res.DokumentListe) != 2 {
		t.Errorf("dokumenter = %d", len(res.DokumentListe))
	}

	n, err := c.Tell(context.Background(), KildeBrreg, "organisasjonsform.kode:AS")
	if err != nil {
		t.Fatal(err)
	}
	if n != 42 {
		t.Errorf("treff = %d", n)
	}
}

func TestFeil(t *testing.T) {
	tests := []struct {
		navn   string
		status int
		body   string
		vil    error
	}{
		{"404", http.StatusNotFound, "", ErrNotFound},
		{"500", http.StatusInternalServerError, "boom", ErrInvalidResponse},
		{"ugyldig json", http.StatusOK, "ikke json", ErrInvalidResponse},
	}
	for _, tt := range tests {
		t.Run(tt.navn, func(t *testing.T) {
			c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(tt.status)
				w.Write([]byte(tt.body))
			})
			_, err := c.Soek(context.Background(), KildeFreg, SoekParams{KQL: "x"})
			if !errors.Is(err, tt.vil) {
				t.Errorf("err = %v, vil ha %v", err, tt.vil)
			}
		})
	}

	c := NewTenorClient(StaticToken("tok"))
	if _, err := c.Soek(context.Background(), "", SoekParams{}); !errors.Is(err, ErrInvalid) {
		t.Errorf("tom kilde: err = %v", err)
	}
	c.baseURL = "http://127.0.0.1:1"
	if _, err := c.Soek(context.Background(), KildeFreg, SoekParams{}); !errors.Is(err, ErrConnection) {
		t.Errorf("ingen server: err = %v", err)
	}
}

func TestLesTenorMetadataMangler(t *testing.T) {
	if _, err := LesTenorMetadata([]byte(`{"id":"1"}`)); !errors.Is(err, ErrInvalidResponse) {
		t.Errorf("err = %v", err)
	}
}

func TestKQL(t *testing.T) {
	naa := time.Date(2026, 10, 27, 12, 0, 0, 0, time.UTC)
	tests := []struct {
		navn, fikk, vil string
	}{
		{"er", Er(FregFornavn, `O"Brien`), `fornavn:"O\"Brien"`},
		{"er en av", ErEnAv(FregSivilstand, SivilstandGift, SivilstandSkilt), `sivilstand:("gift" or "skilt")`},
		{"finnes", Finnes(FregDeltBosted), "deltBosted:*"},
		{"bool", ErSann(FregHarRettsligHandleevne, true), "harRettsligHandleevne:true"},
		{"sammenlign", Sammenlign(FregNavnLengde, StoerreEnn, "50"), "navnLengde>50"},
		{"åpent intervall", Intervall(FregAntallBarn, "2", ""), "antallBarn:[2 to *]"},
		{"nestet", Nestet("tenorRelasjoner.arbeidsforhold", Er("ansettelsesform", "fast")),
			`tenorRelasjoner.arbeidsforhold:{ansettelsesform:"fast"}`},
		{"og hopper over tomme", Og("a:1", "", "b:2"), "(a:1) AND (b:2)"},
		{"og med én del", Og("a:1", " "), "a:1"},
		{"eller", Eller("a:1", "b:2"), "(a:1) OR (b:2)"},
		{"ikke", Ikke(Er(FregKjoenn, KjoennMann)), `NOT (kjoenn:"mann")`},
		{"bosatt myndig", BosattMyndigKQL(naa), `(personstatus:"bosatt") AND (foedselsdato:[* to 2008-10-27])`},
	}
	for _, tt := range tests {
		if tt.fikk != tt.vil {
			t.Errorf("%s: fikk %q, vil ha %q", tt.navn, tt.fikk, tt.vil)
		}
	}
}
