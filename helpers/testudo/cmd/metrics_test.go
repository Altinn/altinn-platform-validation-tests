package cmd

import (
	"errors"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/testutil"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/selfservice"
)

func TestKeyExpiryCollector(t *testing.T) {
	calls := 0
	c := newTestSelfService(t, func(w http.ResponseWriter, r *http.Request) {
		calls++
		id := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/clients/"), "/")[0]
		if strings.HasSuffix(r.URL.Path, "/jwks") {
			if id == keyClients[0].id {
				w.Write([]byte(`{"keys":[{"kid":"k1","exp":1798761600},{"kid":"no-exp"}]}`))
				return
			}
			w.Write([]byte(`{"keys":[]}`))
			return
		}
		w.Write([]byte(`{"client_id":"` + id + `","client_name":"tenor-autorisasjon","client_orgno":"991825827"}`))
	})

	now := time.Date(2026, 11, 25, 12, 0, 0, 0, time.UTC)
	collector := &keyExpiryCollector{
		newClient: func() (*selfservice.Client, error) { return c, nil },
		now:       func() time.Time { return now },
	}

	want := `
# HELP maskinporten_client_key_expiry_timestamp_seconds When the key on the Maskinporten client expires, in Unix seconds. Days left is (value - time()) / 86400. Keys without exp are left out.
# TYPE maskinporten_client_key_expiry_timestamp_seconds gauge
maskinporten_client_key_expiry_timestamp_seconds{client_id="` + keyClients[0].id + `",client_name="tenor-autorisasjon",kid="k1",org="991825827",used_by="` + keyClients[0].usedBy + `"} 1.7987616e+09
`
	if err := testutil.CollectAndCompare(collector, strings.NewReader(want)); err != nil {
		t.Fatal(err)
	}

	// Within the cache time the API is not asked again.
	before := calls
	now = now.Add(keyExpiryCacheFor - time.Second)
	if err := testutil.CollectAndCompare(collector, strings.NewReader(want)); err != nil {
		t.Fatal(err)
	}
	if calls != before {
		t.Errorf("the API was asked again within the cache time: %d calls, want %d", calls, before)
	}
	now = now.Add(2 * time.Second)
	testutil.CollectAndCount(collector)
	if calls == before {
		t.Error("the API was not asked again after the cache time")
	}
}

func TestKeyExpiryCollectorFailsTheScrape(t *testing.T) {
	collector := &keyExpiryCollector{
		newClient: func() (*selfservice.Client, error) { return nil, errs.Invalid },
		now:       time.Now,
	}
	reg := prometheus.NewPedanticRegistry()
	reg.MustRegister(collector)
	if _, err := reg.Gather(); !errors.Is(err, errs.Invalid) {
		t.Errorf("err = %v", err)
	}
}
