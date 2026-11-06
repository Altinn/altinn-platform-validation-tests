package cmd

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register/registertest"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor/tenortest"
)

// testServer is a server with Tenor c and Register reg for at23.
func testServer(c *tenor.Client, reg *register.Client) *server {
	return &server{
		tenor:     c,
		registers: map[string]*register.Client{"at23": reg},
		log:       &bytes.Buffer{},
	}
}

// get sends GET target to s and returns the response.
func get(s *server, target string) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	s.handler().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, target, nil))
	return rec
}

func TestServeFindPersons(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.FregResponse(t, 2, 1, 1, 3))
	})
	s := testServer(c, registertest.Echo(t))

	// CSV with the default columns is the default.
	rec := get(s, "/find/persons?env=at23&count=2")
	lines := strings.Split(strings.TrimSpace(rec.Body.String()), "\n")
	if rec.Code != http.StatusOK || rec.Header().Get("Content-Type") != "text/csv; charset=utf-8" ||
		len(lines) != 3 || lines[0] != "personIdentifier,userId,partyId,partyUuid" {
		t.Fatalf("status = %d, content type = %q, body = %s", rec.Code, rec.Header().Get("Content-Type"), rec.Body)
	}

	// Without env, at23 is used, the only environment the test server has.
	if rec := get(s, "/find/persons?count=2"); rec.Code != http.StatusOK {
		t.Errorf("no env: status = %d, body = %s", rec.Code, rec.Body)
	}

	rec = get(s, "/find/persons?env=at23&count=2&columns=personIdentifier,displayName")
	want := "personIdentifier,displayName\n00000000001,PERSON 00000000001\n00000000002,PERSON 00000000002\n"
	if rec.Code != http.StatusOK || rec.Body.String() != want {
		t.Errorf("columns: status = %d, body = %q", rec.Code, rec.Body)
	}

	// format=json and json give JSON, as --format json and --json do.
	for _, target := range []string{"/find/persons?env=at23&count=2&format=json", "/find/persons?env=at23&count=2&json"} {
		rec = get(s, target)
		if rec.Code != http.StatusOK || rec.Header().Get("Content-Type") != "application/json" {
			t.Fatalf("%s: status = %d, content type = %q, body = %s", target, rec.Code, rec.Header().Get("Content-Type"), rec.Body)
		}
		var persons []map[string]any
		if err := json.Unmarshal(rec.Body.Bytes(), &persons); err != nil {
			t.Fatal(err)
		}
		if len(persons) != 2 || persons[0]["personIdentifier"] != "00000000001" {
			t.Errorf("%s: json = %s", target, rec.Body)
		}
	}

	// name without a value is true, as the flag is.
	rec = get(s, "/find/persons?env=at23&count=2&format=text&name")
	want = "00000000001\tPERSON 00000000001\n00000000002\tPERSON 00000000002\n"
	if rec.Code != http.StatusOK || rec.Body.String() != want {
		t.Errorf("text: status = %d, body = %q", rec.Code, rec.Body)
	}
}

func TestServeFindPersonsErrors(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.FregResponse(t, 2, 1, 1, 3))
	})
	s := testServer(c, registertest.Echo(t))

	tests := []struct {
		target string
		status int
		want   string
	}{
		{"/find/persons?env=at23&out=persons.csv", http.StatusBadRequest, `unknown query parameter "out"`},
		{"/find/persons?env=at23&count=0", http.StatusBadRequest, "count must be at least 1"},
		{"/find/persons?env=at23&count=two", http.StatusBadRequest, "count must be a number"},
		{"/find/persons?env=at23&name=maybe", http.StatusBadRequest, "name must be true or false"},
		{"/find/persons?env=at23&format=json&columns=displayName", http.StatusBadRequest, "--columns only works with --format csv"},
		{"/find/persons?env=at23&columns=age", http.StatusBadRequest, `unknown column "age"`},
		{"/find/persons?env=at23&format=xml", http.StatusBadRequest, `unknown --format "xml"`},
		{"/find/persons?env=prod", http.StatusBadRequest, `unknown environment "prod"`},
	}
	for _, tt := range tests {
		rec := get(s, tt.target)
		if rec.Code != tt.status || rec.Header().Get("Content-Type") != "application/json" {
			t.Errorf("%s: status = %d, content type = %q", tt.target, rec.Code, rec.Header().Get("Content-Type"))
		}
		var body struct{ Error string }
		if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil || !strings.Contains(body.Error, tt.want) {
			t.Errorf("%s: body = %s, want an error with %q", tt.target, rec.Body, tt.want)
		}
	}

	// Nobody from Tenor exists in Register.
	rec := get(testServer(c, registertest.Empty(t)), "/find/persons?env=at23&count=2")
	if rec.Code != http.StatusNotFound || !strings.Contains(rec.Body.String(), "no matches that exist in Register") {
		t.Errorf("empty Register: status = %d, body = %s", rec.Code, rec.Body)
	}
}

func TestServeFindOrganizations(t *testing.T) {
	var kql string
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		kql = r.URL.Query().Get("kql")
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	s := testServer(c, registertest.Echo(t))

	// CSV with the default columns is the default.
	rec := get(s, "/find/organizations?env=at23&count=2")
	lines := strings.Split(strings.TrimSpace(rec.Body.String()), "\n")
	if rec.Code != http.StatusOK || rec.Header().Get("Content-Type") != "text/csv; charset=utf-8" ||
		len(lines) != 3 || lines[0] != "organizationIdentifier,displayName,partyId,partyUuid" {
		t.Fatalf("status = %d, content type = %q, body = %s", rec.Code, rec.Header().Get("Content-Type"), rec.Body)
	}

	// Without env, at23 is used, the only environment the test server has.
	if rec := get(s, "/find/organizations?count=2"); rec.Code != http.StatusOK {
		t.Errorf("no env: status = %d, body = %s", rec.Code, rec.Body)
	}

	rec = get(s, "/find/organizations?env=at23&count=2&columns=organizationIdentifier,displayName,ssn")
	want := "organizationIdentifier,displayName,ssn\n" +
		"000000001,VIRKSOMHET 000000001," + tenortest.LeaderSSN(1) + "\n" +
		"000000002,VIRKSOMHET 000000002," + tenortest.LeaderSSN(2) + "\n"
	if rec.Code != http.StatusOK || rec.Body.String() != want {
		t.Errorf("columns: status = %d, body = %q", rec.Code, rec.Body)
	}

	// JSON has everything, with the leader as the person.
	rec = get(s, "/find/organizations?env=at23&count=2&format=json")
	if rec.Code != http.StatusOK || rec.Header().Get("Content-Type") != "application/json" {
		t.Fatalf("json: status = %d, content type = %q, body = %s", rec.Code, rec.Header().Get("Content-Type"), rec.Body)
	}
	var organizations []map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &organizations); err != nil {
		t.Fatal(err)
	}
	if len(organizations) != 2 || organizations[0]["personRole"] != "daglig-leder" {
		t.Errorf("json = %s", rec.Body)
	}

	// Lists can be repeated or comma-separated.
	for _, target := range []string{
		"/find/organizations?env=at23&count=2&unit-type=AS&unit-type=ENK",
		"/find/organizations?env=at23&count=2&unit-type=AS,ENK",
	} {
		kql = ""
		if rec := get(s, target); rec.Code != http.StatusOK {
			t.Errorf("%s: status = %d, body = %s", target, rec.Code, rec.Body)
		}
		if !strings.Contains(kql, `"AS"`) || !strings.Contains(kql, `"ENK"`) {
			t.Errorf("%s: kql = %q", target, kql)
		}
	}
}

func TestServeFindOrganizationsErrors(t *testing.T) {
	c := tenortest.NewClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(tenortest.BrregResponse(t, 2, 1, 1, 3))
	})
	s := testServer(c, registertest.Echo(t))

	tests := []struct {
		target string
		want   string
	}{
		{"/find/organizations?env=at23&n=5", `unknown query parameter "n"`},
		{"/find/organizations?env=at23&unit-type=XYZ", `unknown --unit-type "XYZ"`},
		{"/find/organizations?env=at23&unit-type=AS&orgno=123456789", "--orgno and --unit-type cannot be used together"},
		{"/find/organizations?env=at23&orgno=123456789&count=2", "--count cannot be used with --orgno"},
		// subunits without a value is true.
		{"/find/organizations?env=at23&subunits&orgno=123456789", "--subunits cannot be used with --orgno or --role"},
		{"/find/organizations?env=at23&subunits=maybe", "subunits must be true or false"},
		{"/find/organizations?env=at23&min-subunits=many", "min-subunits must be a number"},
		{"/find/organizations?env=at23&person-role=sjef", `unknown --person-role "sjef"`},
	}
	for _, tt := range tests {
		rec := get(s, tt.target)
		var body struct{ Error string }
		if rec.Code != http.StatusBadRequest || json.Unmarshal(rec.Body.Bytes(), &body) != nil || !strings.Contains(body.Error, tt.want) {
			t.Errorf("%s: status = %d, body = %s, want 400 with %q", tt.target, rec.Code, rec.Body, tt.want)
		}
	}
}

func TestServeOnlyGet(t *testing.T) {
	s := testServer(nil, nil)
	rec := httptest.NewRecorder()
	s.handler().ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/find/persons", nil))
	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("POST: status = %d", rec.Code)
	}
	if rec := get(s, "/find/everything"); rec.Code != http.StatusNotFound {
		t.Errorf("unknown path: status = %d", rec.Code)
	}
}
