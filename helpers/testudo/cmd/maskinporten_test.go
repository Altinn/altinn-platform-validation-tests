package cmd

import (
	"bytes"
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/selfservice"
)

type staticToken string

func (s staticToken) Token(context.Context) (string, error) { return string(s), nil }

func newTestSelfService(t *testing.T, handler http.HandlerFunc) *selfservice.Client {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	return selfservice.NewClient(srv.URL, staticToken("tok"))
}

func TestClientKeys(t *testing.T) {
	now := time.Date(2026, 11, 25, 12, 0, 0, 0, time.UTC)
	exp := func(d time.Duration) string { return strconv.FormatInt(now.Add(d).Unix(), 10) }

	c := newTestSelfService(t, func(w http.ResponseWriter, r *http.Request) {
		id := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/clients/"), "/")[0]
		if strings.HasSuffix(r.URL.Path, "/jwks") {
			if id == keyClients[0].id {
				w.Write([]byte(`{"keys":[
					{"kid":"later","exp":` + exp(100*24*time.Hour) + `},
					{"kid":"no-exp"},
					{"kid":"expired","exp":` + exp(-36*time.Hour) + `},
					{"kid":"soon","exp":` + exp(30*time.Hour) + `}
				]}`))
				return
			}
			w.Write([]byte(`{"keys":[]}`))
			return
		}
		w.Write([]byte(`{"client_id":"` + id + `","client_name":"name-` + id[:4] + `","client_orgno":"991825827"}`))
	})

	keys, err := clientKeys(context.Background(), c, now)
	if err != nil {
		t.Fatal(err)
	}
	var got []string
	for _, k := range keys {
		days := "nil"
		if k.DaysLeft != nil {
			days = strconv.FormatInt(int64(*k.DaysLeft), 10)
		}
		got = append(got, k.Kid+":"+days)
	}
	if want := "expired:-2 soon:1 later:100 no-exp:nil"; strings.Join(got, " ") != want {
		t.Errorf("keys = %s, want %s", strings.Join(got, " "), want)
	}
	if k := keys[0]; k.ClientID != keyClients[0].id || k.Org != "991825827" || k.UsedBy != keyClients[0].usedBy {
		t.Errorf("key = %+v", k)
	}

	var out bytes.Buffer
	if err := writeKeysText(&out, keys); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(out.String(), "DAYS LEFT") || !strings.Contains(out.String(), "no exp") ||
		!strings.Contains(out.String(), "2026-11-26") {
		t.Errorf("text:\n%s", out.String())
	}
}

func TestClientKeysNamesTheClientThatFails(t *testing.T) {
	c := newTestSelfService(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusForbidden)
	})
	_, err := clientKeys(context.Background(), c, time.Now())
	if !errors.Is(err, errs.InvalidResponse) || !strings.Contains(err.Error(), keyClients[0].id) {
		t.Errorf("err = %v", err)
	}
}
