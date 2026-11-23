package register_test

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register/registertest"
)

func TestQueryPartiesDecodesAllTypes(t *testing.T) {
	c := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := registertest.ReadQuery(t, r)
		if r.URL.Query().Get("fields") != "party,person,org,user,si,sysuser" {
			t.Errorf("fields = %q", r.URL.Query().Get("fields"))
		}
		if len(urns) != 2 || urns[0] != "urn:altinn:person:identifier-no:01010112345" ||
			urns[1] != "urn:altinn:organization:identifier-no:123456789" {
			t.Errorf("urns = %v", urns)
		}
		w.WriteHeader(http.StatusPartialContent)
		w.Write([]byte(`{"data":[
			{"partyUuid":"p-1","versionId":7,"urn":"urn:altinn:party:uuid:p-1","partyId":501,"partyType":"person",
			 "displayName":"OLA NORDMANN","isDeleted":false,"deletedAt":null,
			 "user":{"userId":20001,"username":"ola","userIds":[20001,19999]},
			 "personIdentifier":"01010112345","firstName":"OLA","lastName":"NORDMANN","dateOfBirth":"2001-01-01",
			 "address":{"streetName":"Gata","houseNumber":"1","postalCode":"0101","city":"OSLO"},
			 "mailingAddress":{"address":"Gata 1","postalCode":"0101","city":"OSLO"}},
			{"partyUuid":"p-2","partyId":502,"partyType":"organization","organizationIdentifier":"123456789",
			 "unitType":"AS","businessAddress":{"city":"BERGEN"}},
			{"partyUuid":"p-3","partyType":"system-user","systemUserType":"client-party-system-user",
			 "owner":{"partyUuid":"p-2","urn":"urn:altinn:party:uuid:p-2"}}
		]}`))
	})

	parties, err := c.QueryParties(context.Background(),
		[]register.PartyURN{register.PersonURN("01010112345"), register.OrganizationURN("123456789")},
		register.FieldParty, register.FieldPerson, register.FieldOrg, register.FieldUser, register.FieldSI, register.FieldSysuser)
	if err != nil {
		t.Fatal(err)
	}
	if len(parties) != 3 {
		t.Fatalf("parties = %d", len(parties))
	}
	p := parties[0]
	if p.PartyID != 501 || p.PartyType != register.PartyTypePerson || p.User == nil || p.User.UserID != 20001 ||
		len(p.User.UserIDs) != 2 || p.Address == nil || p.Address.City != "OSLO" || p.MailingAddress.Address != "Gata 1" ||
		p.DeletedAt != "" || p.VersionID != 7 {
		t.Errorf("person = %+v", p)
	}
	if o := parties[1]; o.OrganizationIdentifier != "123456789" || o.UnitType != "AS" || o.BusinessAddress.City != "BERGEN" {
		t.Errorf("org = %+v", o)
	}
	if s := parties[2]; s.SystemUserType != "client-party-system-user" || s.Owner == nil || s.Owner.PartyUUID != "p-2" {
		t.Errorf("system user = %+v", s)
	}
}

func TestQueryPartiesSplitsIntoBatches(t *testing.T) {
	var batches []int
	c := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := registertest.ReadQuery(t, r)
		batches = append(batches, len(urns))
		if r.URL.RawQuery != "" {
			t.Errorf("without fields, the fields parameter should be left out: %q", r.URL.RawQuery)
		}
		if len(batches) == 2 {
			// Last batch: no hits.
			w.WriteHeader(http.StatusNoContent)
			return
		}
		data := []map[string]string{}
		for i := range urns {
			data = append(data, map[string]string{"partyUuid": fmt.Sprint(i)})
		}
		json.NewEncoder(w).Encode(map[string]any{"data": data})
	})

	urns := make([]register.PartyURN, 150)
	for i := range urns {
		urns[i] = register.PartyIDURN(uint32(i + 1))
	}
	parties, err := c.QueryParties(context.Background(), urns)
	if err != nil {
		t.Fatal(err)
	}
	if fmt.Sprint(batches) != "[100 50]" || len(parties) != 100 {
		t.Errorf("batches = %v, parties = %d", batches, len(parties))
	}
}

func TestQueryPartiesEmptyListMakesNoCalls(t *testing.T) {
	c := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		t.Error("unexpected call")
	})
	parties, err := c.QueryParties(context.Background(), nil)
	if err != nil || len(parties) != 0 {
		t.Errorf("parties = %v, err = %v", parties, err)
	}
}

func TestLookupIdentifiers(t *testing.T) {
	c := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := registertest.ReadQuery(t, r)
		if len(urns) != 3 {
			t.Errorf("duplicates were not removed: %v", urns)
		}
		w.Write([]byte(`{"data":[
			{"partyUuid":"a","partyId":1,"personIdentifier":"01010112345"},
			{"partyUuid":"b","partyId":2,"organizationIdentifier":"123456789"}]}`))
	})
	m, err := c.LookupIdentifiers(context.Background(),
		[]string{"01010112345", "123456789", "01010112345", "99999999999"}, register.FieldParty)
	if err != nil {
		t.Fatal(err)
	}
	if len(m) != 2 || m["01010112345"].PartyID != 1 || m["123456789"].PartyUUID != "b" {
		t.Errorf("m = %+v", m)
	}
	if _, ok := m["99999999999"]; ok {
		t.Error("unknown identifier should not be included")
	}

	if _, err := c.LookupIdentifiers(context.Background(), []string{"123"}); !errors.Is(err, errs.Invalid) {
		t.Errorf("invalid identifier: err = %v", err)
	}
}

func TestLookupIdentifiersUnknownParty(t *testing.T) {
	c := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"data":[{"partyUuid":"x","personIdentifier":"22222222222"}]}`))
	})
	if _, err := c.LookupIdentifiers(context.Background(), []string{"11111111111"}); !errors.Is(err, errs.InvalidResponse) {
		t.Errorf("err = %v", err)
	}
}

func TestGetParty(t *testing.T) {
	c := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet || r.URL.Path != "/register/api/v1/access-management/parties/p-1" ||
			r.URL.Query().Get("fields") != "person.name" {
			t.Errorf("%s %s?%s", r.Method, r.URL.Path, r.URL.RawQuery)
		}
		w.Write([]byte(`{"partyUuid":"p-1","firstName":"KARI"}`))
	})
	p, err := c.GetParty(context.Background(), "p-1", register.FieldPersonName)
	if err != nil {
		t.Fatal(err)
	}
	if p.FirstName != "KARI" {
		t.Errorf("p = %+v", p)
	}
}

func TestRegisterErrors(t *testing.T) {
	tests := []struct {
		name   string
		status int
		body   string
		want   error
	}{
		{"404", http.StatusNotFound, "", errs.NotFound},
		{"400 problem details", http.StatusBadRequest, `{"title":"Bad request","code":"REG-00001"}`, errs.InvalidResponse},
		{"invalid json", http.StatusOK, "not json", errs.InvalidResponse},
		{"missing data", http.StatusOK, `{}`, errs.InvalidResponse},
	}
	for _, tt := range tests {
		c := registertest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(tt.status)
			w.Write([]byte(tt.body))
		})
		_, err := c.QueryParties(context.Background(), []register.PartyURN{register.PartyIDURN(1)})
		if !errors.Is(err, tt.want) {
			t.Errorf("%s: err = %v", tt.name, err)
		}
		if tt.status == http.StatusBadRequest && !strings.Contains(err.Error(), "REG-00001") {
			t.Errorf("%s: problem details missing from the error: %v", tt.name, err)
		}
	}
}

func TestPartyUrn(t *testing.T) {
	for got, want := range map[register.PartyURN]string{
		register.PartyUUIDURN("abc"):              "urn:altinn:party:uuid:abc",
		register.UserIDURN(42):                    "urn:altinn:user:id:42",
		register.UsernameURN("ola"):               "urn:altinn:party:username:ola",
		register.IDPortenEmailURN("a@example.no"): "urn:altinn:person:idporten-email:a@example.no",
	} {
		if string(got) != want {
			t.Errorf("got %q, want %q", got, want)
		}
	}
}
