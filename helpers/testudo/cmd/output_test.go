package cmd

import (
	"bytes"
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

type testRad struct{ a, b string }

var testKolonner = []kolonne[testRad]{
	{navn: "a", verdi: func(r testRad) string { return r.a }},
	{navn: "b", verdi: func(r testRad) string { return r.b }},
}

func TestEffektivtFormat(t *testing.T) {
	tests := []struct {
		format string
		json   bool
		vil    string
	}{
		{"", false, formatTekst},
		{"", true, formatJSON},
		{"csv", true, formatCSV},
		{"text", true, formatTekst},
	}
	for _, tt := range tests {
		if got := (utskriftValg{format: tt.format}).effektivtFormat(tt.json); got != tt.vil {
			t.Errorf("%+v: fikk %q, vil ha %q", tt, got, tt.vil)
		}
	}
}

func TestValiderUtskrift(t *testing.T) {
	standard := []string{"a"}
	tests := []struct {
		navn    string
		v       utskriftValg
		ugyldig string
	}{
		{"tekst", utskriftValg{}, ""},
		{"csv med standard", utskriftValg{format: "csv"}, ""},
		{"csv med valgte kolonner", utskriftValg{format: "csv", kolonner: "a,b"}, ""},
		{"ukjent format", utskriftValg{format: "xml"}, "ukjent --format"},
		{"kolonner uten csv", utskriftValg{kolonner: "a"}, "bare med --format csv"},
		{"ukjent kolonne", utskriftValg{format: "csv", kolonner: "a,c"}, `ukjent kolonne "c", bruk en av a,b`},
	}
	for _, tt := range tests {
		err := validerUtskrift(tt.v, false, testKolonner, standard)
		if tt.ugyldig == "" {
			if err != nil {
				t.Errorf("%s: %v", tt.navn, err)
			}
			continue
		}
		if !errors.Is(err, errs.Invalid) || !strings.Contains(err.Error(), tt.ugyldig) {
			t.Errorf("%s: err = %v", tt.navn, err)
		}
	}
}

func TestSkrivCSV(t *testing.T) {
	kolonner, err := velgKolonner(testKolonner, " b , a", nil)
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
