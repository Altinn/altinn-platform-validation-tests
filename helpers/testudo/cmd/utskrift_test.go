package cmd

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

type testRad struct{ a, b string }

var testKolonner = []kolonne[testRad]{
	{navn: "a", verdi: func(r testRad) string { return r.a }},
	{navn: "b", register: true, verdi: func(r testRad) string { return r.b }},
}

func TestEffektivtFormat(t *testing.T) {
	tests := []struct {
		format         string
		json, register bool
		vil            string
	}{
		{"", false, false, formatTekst},
		{"", true, false, formatJSON},
		{"", false, true, formatJSON},
		{"csv", false, true, formatCSV},
		{"tekst", false, true, formatTekst},
	}
	for _, tt := range tests {
		if got := (utskriftValg{format: tt.format}).effektivtFormat(tt.json, tt.register); got != tt.vil {
			t.Errorf("%+v: fikk %q, vil ha %q", tt, got, tt.vil)
		}
	}
}

func TestValiderUtskrift(t *testing.T) {
	standard := []string{"a"}
	tests := []struct {
		navn     string
		v        utskriftValg
		register bool
		ugyldig  string
	}{
		{"tekst", utskriftValg{}, false, ""},
		{"csv med standard", utskriftValg{format: "csv"}, false, ""},
		{"csv med register-kolonne", utskriftValg{format: "csv", kolonner: "a,b"}, true, ""},
		{"ukjent format", utskriftValg{format: "xml"}, false, "ukjent --format"},
		{"kolonner uten csv", utskriftValg{kolonner: "a"}, false, "bare med --format csv"},
		{"ukjent kolonne", utskriftValg{format: "csv", kolonner: "a,c"}, false, `ukjent kolonne "c", bruk en av a,b`},
		{"register-kolonne uten --register", utskriftValg{format: "csv", kolonner: "b"}, false, "kolonnen b kommer fra Register"},
	}
	for _, tt := range tests {
		err := validerUtskrift(tt.v, false, tt.register, testKolonner, standard)
		if tt.ugyldig == "" {
			if err != nil {
				t.Errorf("%s: %v", tt.navn, err)
			}
			continue
		}
		if !errors.Is(err, ErrInvalid) || !strings.Contains(err.Error(), tt.ugyldig) {
			t.Errorf("%s: err = %v", tt.navn, err)
		}
	}
}

func TestSkrivCSV(t *testing.T) {
	kolonner, err := velgKolonner(testKolonner, " b , a", nil, true)
	if err != nil {
		t.Fatal(err)
	}
	var buf bytes.Buffer
	hoppetOver, err := skrivCSV(&buf, []testRad{{"1", "x"}, {"2", ""}, {"med,komma", "y"}}, kolonner)
	if err != nil {
		t.Fatal(err)
	}
	if hoppetOver != 1 {
		t.Errorf("hoppetOver = %d", hoppetOver)
	}
	if buf.String() != "b,a\nx,1\ny,\"med,komma\"\n" {
		t.Errorf("csv = %q", buf.String())
	}
}

func TestMedUtFil(t *testing.T) {
	var stdout, logg bytes.Buffer
	skriv := func(ut io.Writer) error { _, err := ut.Write([]byte("innhold")); return err }

	if err := medUtFil("", &stdout, &logg, skriv); err != nil || stdout.String() != "innhold" {
		t.Errorf("stdout = %q, err = %v", stdout.String(), err)
	}

	sti := filepath.Join(t.TempDir(), "ut.csv")
	stdout.Reset()
	if err := medUtFil(sti, &stdout, &logg, skriv); err != nil {
		t.Fatal(err)
	}
	if b, _ := os.ReadFile(sti); string(b) != "innhold" || stdout.Len() != 0 {
		t.Errorf("fil = %q, stdout = %q", b, stdout.String())
	}
	if !strings.Contains(logg.String(), "Skrev resultatet til "+sti) {
		t.Errorf("logg = %q", logg.String())
	}

	// Feil underveis gir ingen fil.
	feilSti := filepath.Join(t.TempDir(), "feil.csv")
	err := medUtFil(feilSti, &stdout, &logg, func(ut io.Writer) error {
		ut.Write([]byte("halv"))
		return errors.New("boom")
	})
	if err == nil {
		t.Fatal("ventet feil")
	}
	if _, err := os.Stat(feilSti); !os.IsNotExist(err) {
		t.Errorf("fil ble skrevet selv om kjøringen feilet: %v", err)
	}
}

func TestPersonerCSV(t *testing.T) {
	tenor := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(fregSvar(t, 3, 1, 1, 4))
	})
	reg := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		// Person 1 er komplett, person 2 mangler bruker, person 3 finnes ikke.
		w.Write([]byte(`{"data":[
			{"partyUuid":"u-1","partyId":501,"personIdentifier":"00000000001","lastName":"NORDMANN","user":{"userId":20001}},
			{"partyUuid":"u-2","partyId":502,"personIdentifier":"00000000002"}]}`))
	})

	var ut, logg bytes.Buffer
	opts := &personerOptions{antall: 3, register: true, env: "at23", utskrift: utskriftValg{format: "csv"}}
	if err := runPersoner(context.Background(), tenor, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if ut.String() != "ssn,userId,userPartyId,userPartyUuid\n00000000001,20001,501,u-1\n" {
		t.Errorf("csv = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "Hoppet over 2 personer") {
		t.Errorf("logg = %q", logg.String())
	}

	// Uten --register: bare Tenor-kolonner, etternavn fra Tenor.
	ut.Reset()
	opts = &personerOptions{antall: 3, utskrift: utskriftValg{format: "csv", kolonner: "ssn,firstName,lastName"}}
	if err := runPersoner(context.Background(), tenor, nil, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(ut.String(), "ssn,firstName,lastName\n00000000001,Person,1\n") {
		t.Errorf("csv = %q", ut.String())
	}
}

func TestVirksomheterCSV(t *testing.T) {
	tenor := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write(brregSvar(t, 2, 1, 1, 3))
	})
	reg := testRegisterClient(t, func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `{"data":[
			{"partyUuid":"o-1","partyId":601,"organizationIdentifier":"000000001"},
			{"partyUuid":"p-1","partyId":701,"personIdentifier":"%s","lastName":"LEDER","user":{"userId":30001}},
			{"partyUuid":"o-2","partyId":602,"organizationIdentifier":"000000002"}]}`, lederFnr(1))
	})

	var ut, logg bytes.Buffer
	opts := &virksomheterOptions{antall: 2, register: true, env: "at23", utskrift: utskriftValg{format: "csv"}}
	if err := runVirksomheter(context.Background(), tenor, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	vil := "orgNo,orgName,orgPartyId,orgUuid\n000000001,FIRMA 1 AS,601,o-1\n000000002,FIRMA 2 AS,602,o-2\n"
	if ut.String() != vil {
		t.Errorf("csv = %q", ut.String())
	}

	// Hele den kanoniske raden: virksomhet 2 mangler daglig leder i Register.
	ut.Reset()
	logg.Reset()
	opts.utskrift.kolonner = "orgNo,orgPartyId,orgUuid,ssn,userId,userPartyId,userPartyUuid,lastName"
	if err := runVirksomheter(context.Background(), tenor, reg, &ut, &logg, opts); err != nil {
		t.Fatal(err)
	}
	vil = "orgNo,orgPartyId,orgUuid,ssn,userId,userPartyId,userPartyUuid,lastName\n" +
		"000000001,601,o-1," + lederFnr(1) + ",30001,701,p-1,LEDER\n"
	if ut.String() != vil {
		t.Errorf("csv = %q", ut.String())
	}
	if !strings.Contains(logg.String(), "Hoppet over 1 rader") {
		t.Errorf("logg = %q", logg.String())
	}
}
