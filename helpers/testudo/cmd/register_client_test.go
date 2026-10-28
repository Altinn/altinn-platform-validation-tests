package cmd

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func testRegisterClient(t *testing.T, h http.HandlerFunc) *RegisterClient {
	t.Helper()
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	return NewRegisterClient(srv.URL+"/", "nøkkel", StaticToken("plattform"))
}

// lesQuery sjekker headere og returnerer URN-ene i forespørselen.
func lesQuery(t *testing.T, r *http.Request) []string {
	t.Helper()
	if r.Method != http.MethodPost || r.URL.Path != "/register/api/v1/access-management/parties/query" {
		t.Errorf("%s %s", r.Method, r.URL.Path)
	}
	if r.Header.Get("PlatformAccessToken") != "plattform" || r.Header.Get("Ocp-Apim-Subscription-Key") != "nøkkel" ||
		r.Header.Get("Content-Type") != "application/json" || r.Header.Get("Authorization") != "" {
		t.Errorf("headere = %v", r.Header)
	}
	var body struct {
		Data []string `json:"data"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	return body.Data
}

func TestQueryPartiesDekoderAlleTyper(t *testing.T) {
	c := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := lesQuery(t, r)
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

	parter, err := c.QueryParties(context.Background(),
		[]PartyUrn{PersonUrn("01010112345"), OrganisasjonUrn("123456789")},
		FeltParty, FeltPerson, FeltOrg, FeltUser, FeltSI, FeltSysuser)
	if err != nil {
		t.Fatal(err)
	}
	if len(parter) != 3 {
		t.Fatalf("parter = %d", len(parter))
	}
	p := parter[0]
	if p.PartyID != 501 || p.PartyType != PartyTypePerson || p.User == nil || p.User.UserID != 20001 ||
		len(p.User.UserIDs) != 2 || p.Address == nil || p.Address.City != "OSLO" || p.MailingAddress.Address != "Gata 1" ||
		p.DeletedAt != "" || p.VersionID != 7 {
		t.Errorf("person = %+v", p)
	}
	if o := parter[1]; o.OrganizationIdentifier != "123456789" || o.UnitType != "AS" || o.BusinessAddress.City != "BERGEN" {
		t.Errorf("org = %+v", o)
	}
	if s := parter[2]; s.SystemUserType != "client-party-system-user" || s.Owner == nil || s.Owner.PartyUUID != "p-2" {
		t.Errorf("systembruker = %+v", s)
	}
}

func TestQueryPartiesDelerOppIBatcher(t *testing.T) {
	var batcher []int
	c := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := lesQuery(t, r)
		batcher = append(batcher, len(urns))
		if r.URL.RawQuery != "" {
			t.Errorf("uten felt skal fields utelates: %q", r.URL.RawQuery)
		}
		if len(batcher) == 2 {
			// Siste batch: ingen treff.
			w.WriteHeader(http.StatusNoContent)
			return
		}
		data := []map[string]string{}
		for i := range urns {
			data = append(data, map[string]string{"partyUuid": fmt.Sprint(i)})
		}
		json.NewEncoder(w).Encode(map[string]any{"data": data})
	})

	urns := make([]PartyUrn, 150)
	for i := range urns {
		urns[i] = PartyIDUrn(uint32(i + 1))
	}
	parter, err := c.QueryParties(context.Background(), urns)
	if err != nil {
		t.Fatal(err)
	}
	if fmt.Sprint(batcher) != "[100 50]" || len(parter) != 100 {
		t.Errorf("batcher = %v, parter = %d", batcher, len(parter))
	}
}

func TestQueryPartiesTomListeGjoerIngenKall(t *testing.T) {
	c := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		t.Error("uventet kall")
	})
	parter, err := c.QueryParties(context.Background(), nil)
	if err != nil || len(parter) != 0 {
		t.Errorf("parter = %v, err = %v", parter, err)
	}
}

func TestSlaaOppIdentifikatorer(t *testing.T) {
	c := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		urns := lesQuery(t, r)
		if len(urns) != 3 {
			t.Errorf("duplikater ble ikke fjernet: %v", urns)
		}
		w.Write([]byte(`{"data":[
			{"partyUuid":"a","partyId":1,"personIdentifier":"01010112345"},
			{"partyUuid":"b","partyId":2,"organizationIdentifier":"123456789"}]}`))
	})
	m, err := c.SlaaOppIdentifikatorer(context.Background(),
		[]string{"01010112345", "123456789", "01010112345", "99999999999"}, FeltParty)
	if err != nil {
		t.Fatal(err)
	}
	if len(m) != 2 || m["01010112345"].PartyID != 1 || m["123456789"].PartyUUID != "b" {
		t.Errorf("m = %+v", m)
	}
	if _, ok := m["99999999999"]; ok {
		t.Error("ukjent identifikator skal ikke være med")
	}

	if _, err := c.SlaaOppIdentifikatorer(context.Background(), []string{"123"}); !errors.Is(err, ErrInvalid) {
		t.Errorf("ugyldig identifikator: err = %v", err)
	}
}

func TestSlaaOppIdentifikatorerUkjentPart(t *testing.T) {
	c := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"data":[{"partyUuid":"x","personIdentifier":"22222222222"}]}`))
	})
	if _, err := c.SlaaOppIdentifikatorer(context.Background(), []string{"11111111111"}); !errors.Is(err, ErrInvalidResponse) {
		t.Errorf("err = %v", err)
	}
}

func TestHentParty(t *testing.T) {
	c := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet || r.URL.Path != "/register/api/v1/access-management/parties/p-1" ||
			r.URL.Query().Get("fields") != "person.name" {
			t.Errorf("%s %s?%s", r.Method, r.URL.Path, r.URL.RawQuery)
		}
		w.Write([]byte(`{"partyUuid":"p-1","firstName":"KARI"}`))
	})
	p, err := c.HentParty(context.Background(), "p-1", FeltPersonName)
	if err != nil {
		t.Fatal(err)
	}
	if p.FirstName != "KARI" {
		t.Errorf("p = %+v", p)
	}
}

func TestRegisterFeil(t *testing.T) {
	tests := []struct {
		navn   string
		status int
		body   string
		vil    error
	}{
		{"404", http.StatusNotFound, "", ErrNotFound},
		{"400 problem details", http.StatusBadRequest, `{"title":"Bad request","code":"REG-00001"}`, ErrInvalidResponse},
		{"ugyldig json", http.StatusOK, "ikke json", ErrInvalidResponse},
		{"mangler data", http.StatusOK, `{}`, ErrInvalidResponse},
	}
	for _, tt := range tests {
		c := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(tt.status)
			w.Write([]byte(tt.body))
		})
		_, err := c.QueryParties(context.Background(), []PartyUrn{PartyIDUrn(1)})
		if !errors.Is(err, tt.vil) {
			t.Errorf("%s: err = %v", tt.navn, err)
		}
		if tt.status == http.StatusBadRequest && !strings.Contains(err.Error(), "REG-00001") {
			t.Errorf("%s: problem details mangler i feilen: %v", tt.navn, err)
		}
	}
}

func TestPartyUrn(t *testing.T) {
	for fikk, vil := range map[PartyUrn]string{
		PartyUUIDUrn("abc"):              "urn:altinn:party:uuid:abc",
		BrukerIDUrn(42):                  "urn:altinn:user:id:42",
		BrukernavnUrn("ola"):             "urn:altinn:party:username:ola",
		IdportenEpostUrn("a@example.no"): "urn:altinn:person:idporten-email:a@example.no",
	} {
		if string(fikk) != vil {
			t.Errorf("fikk %q, vil ha %q", fikk, vil)
		}
	}
}
