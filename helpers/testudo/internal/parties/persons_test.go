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

func TestHentPersonerPaginererMedSeed(t *testing.T) {
	var seeds []string
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		if q.Get("antall") != "200" || q.Get("side") != "0" || q.Get("vis") != "tenorMetadata" {
			t.Errorf("query = %v", q)
		}
		seeds = append(seeds, q.Get("seed"))
		// Første kall har ingen seed; Tenor velger 100. Hver seed gir 200
		// personer som overlapper 50 med forrige seed.
		seed := int32(100)
		if s := q.Get("seed"); s != "" {
			n, _ := strconv.Atoi(s)
			seed = int32(n)
		}
		start := int(seed-100) * 150
		w.Write(tenortest.FregResponse(t, 1_000_000, seed, start, start+200))
	})

	personer, err := hentPersoner(context.Background(), c, "personstatus:bosatt", 450)
	if err != nil {
		t.Fatal(err)
	}
	if len(personer) != 450 {
		t.Fatalf("fikk %d personer, vil ha 450", len(personer))
	}
	unike := map[string]bool{}
	for _, k := range personer {
		unike[k.foedselsnummer] = true
	}
	if len(unike) != 450 {
		t.Errorf("fikk %d unike personer", len(unike))
	}
	// 200 + 150 + 150 > 450, så tre kall.
	if fmt.Sprint(seeds) != "[ 101 102]" {
		t.Errorf("seeds = %q", seeds)
	}
}

func TestHentPersonerStopperVedAlleTreff(t *testing.T) {
	kall := 0
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kall++
		if r.URL.Query().Get("antall") != "10" {
			t.Errorf("antall = %q", r.URL.Query().Get("antall"))
		}
		w.Write(tenortest.FregResponse(t, 3, 1, 0, 3))
	})
	personer, err := hentPersoner(context.Background(), c, "x:y", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(personer) != 3 || kall != 1 {
		t.Errorf("personer = %d, kall = %d", len(personer), kall)
	}
}

func TestHentPersonerStandardKQL(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql := r.URL.Query().Get("kql")
		if kql == "" || kql[:len(`(personstatus:"bosatt")`)] != `(personstatus:"bosatt")` {
			t.Errorf("kql = %q", kql)
		}
		w.Write(tenortest.FregResponse(t, 1, 1, 0, 1))
	})
	if _, err := hentPersoner(context.Background(), c, "", 1); err != nil {
		t.Fatal(err)
	}
}

func TestDefaultPersonKQL(t *testing.T) {
	naa := time.Date(2026, 10, 27, 12, 0, 0, 0, time.UTC)
	if got, vil := DefaultPersonKQL(naa), `(personstatus:"bosatt") AND (foedselsdato:[* to 2008-10-27])`; got != vil {
		t.Errorf("fikk %q, vil ha %q", got, vil)
	}
}

func TestFindPersonsByttesUtNaarDeIkkeFinnesIRegister(t *testing.T) {
	kall := 0
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kall++
		// Første runde gir person 1 og 2. Person 2 finnes ikke i Register, så
		// neste runde gir en ny: person 3.
		if kall == 1 {
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

	var logg bytes.Buffer
	personer, err := FindPersons(context.Background(), c, reg, "x:y", 2, "at23", &logg)
	if err != nil {
		t.Fatal(err)
	}
	if len(personer) != 2 || kall != 2 || personer[0].PartyUUID != "u-1" || personer[0].Kildedata == nil ||
		personer[1].PersonIdentifier != "00000000003" {
		t.Fatalf("personer = %+v, kall til Tenor = %d", personer, kall)
	}
	if !strings.Contains(logg.String(), "Register (at23): 1 personer fra Tenor finnes ikke og er byttet ut.") {
		t.Errorf("logg = %q", logg.String())
	}
}

func TestTilPersonKandidat(t *testing.T) {
	kilde := `{"navn":[{"fornavn":"OLA","etternavn":"NORDMANN","erGjeldende":true}]}`
	k, ok := tilPersonKandidat(tenor.Metadata{ID: "01010112345", Kildedata: kilde})
	if !ok || k.foedselsnummer != "01010112345" || string(k.kildedata) != kilde {
		t.Errorf("k = %+v, ok = %v", k, ok)
	}

	k, ok = tilPersonKandidat(tenor.Metadata{ID: "01010112345", Kildedata: "ikke json"})
	if !ok || k.kildedata != nil {
		t.Errorf("ugyldig kildedata: %+v", k)
	}

	if _, ok := tilPersonKandidat(tenor.Metadata{ID: "123"}); ok {
		t.Error("ugyldig fødselsnummer ble godtatt")
	}
}
