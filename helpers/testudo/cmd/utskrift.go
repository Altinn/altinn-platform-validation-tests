package cmd

// Felles utskrift for kommandoer som skriver rader: tekst, JSON eller CSV med
// valgfrie kolonner. Kolonnenavnene følger det kanoniske skjemaet i
// https://github.com/Altinn/altinn-platform-validation-tests/issues/323.

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"slices"
	"strings"

	"github.com/spf13/cobra"
)

const (
	formatTekst = "tekst"
	formatJSON  = "json"
	formatCSV   = "csv"
)

// utskriftValg er flaggene for utskrift.
type utskriftValg struct {
	// format er tekst, json eller csv. Tom betyr standard: tekst, eller json
	// med --json eller --register.
	format string
	// kolonner er kommaseparerte CSV-kolonner. Tom betyr kommandoens standard.
	kolonner string
	// ut er filen resultatet skrives til. Tom betyr stdout.
	ut string
}

func leggTilUtskriftFlagg(cmd *cobra.Command, v *utskriftValg, standardKolonner []string) {
	cmd.Flags().StringVar(
		&v.format, "format", "",
		"Utskrift: tekst, json eller csv (standard: tekst, eller json med --json/--register)",
	)
	cmd.Flags().StringVar(
		&v.kolonner, "kolonner", "",
		"Kommaseparerte kolonner med --format csv (standard: "+strings.Join(standardKolonner, ",")+")",
	)
	cmd.Flags().StringVar(
		&v.ut, "ut", "",
		"Fil resultatet skrives til (standard: stdout)",
	)
}

// effektivtFormat avgjør formatet når --format ikke er satt.
func (v utskriftValg) effektivtFormat(jsonOutput, register bool) string {
	switch {
	case v.format != "":
		return v.format
	case jsonOutput || register:
		return formatJSON
	default:
		return formatTekst
	}
}

// valider sjekker format og kolonner før noe hentes.
func validerUtskrift[T any](v utskriftValg, jsonOutput, register bool, alle []kolonne[T], standard []string) error {
	format := v.effektivtFormat(jsonOutput, register)
	if !slices.Contains([]string{formatTekst, formatJSON, formatCSV}, format) {
		return fmt.Errorf("%w: ukjent --format %q, bruk tekst, json eller csv", ErrInvalid, format)
	}
	if v.kolonner != "" && format != formatCSV {
		return fmt.Errorf("%w: --kolonner virker bare med --format csv", ErrInvalid)
	}
	if format == formatCSV {
		_, err := velgKolonner(alle, v.kolonner, standard, register)
		return err
	}
	return nil
}

// kolonne er en CSV-kolonne for rader av typen T.
type kolonne[T any] struct {
	navn string
	// register betyr at verdien kommer fra Register og krever --register.
	register bool
	verdi    func(T) string
}

// velgKolonner slår opp kolonnene i spesifikasjon (kommaseparert), eller
// standard hvis den er tom.
func velgKolonner[T any](alle []kolonne[T], spesifikasjon string, standard []string, register bool) ([]kolonne[T], error) {
	navn := standard
	if spesifikasjon != "" {
		navn = strings.Split(spesifikasjon, ",")
	}
	valgt := make([]kolonne[T], 0, len(navn))
	for _, n := range navn {
		n = strings.TrimSpace(n)
		i := slices.IndexFunc(alle, func(k kolonne[T]) bool { return k.navn == n })
		if i < 0 {
			tilgjengelige := make([]string, len(alle))
			for j, k := range alle {
				tilgjengelige[j] = k.navn
			}
			return nil, fmt.Errorf("%w: ukjent kolonne %q, bruk en av %s", ErrInvalid, n, strings.Join(tilgjengelige, ","))
		}
		if alle[i].register && !register {
			return nil, fmt.Errorf("%w: kolonnen %s kommer fra Register og krever --register", ErrInvalid, n)
		}
		valgt = append(valgt, alle[i])
	}
	return valgt, nil
}

// skrivCSV skriver rader med de valgte kolonnene. Rader som mangler en verdi
// hoppes over, siden testene trenger komplette rader, og antallet returneres.
func skrivCSV[T any](ut io.Writer, rader []T, kolonner []kolonne[T]) (int, error) {
	w := csv.NewWriter(ut)
	header := make([]string, len(kolonner))
	for i, k := range kolonner {
		header[i] = k.navn
	}
	if err := w.Write(header); err != nil {
		return 0, err
	}

	hoppetOver := 0
	for _, r := range rader {
		rad := make([]string, len(kolonner))
		komplett := true
		for i, k := range kolonner {
			rad[i] = k.verdi(r)
			komplett = komplett && rad[i] != ""
		}
		if !komplett {
			hoppetOver++
			continue
		}
		if err := w.Write(rad); err != nil {
			return hoppetOver, err
		}
	}
	w.Flush()
	return hoppetOver, w.Error()
}

// medUtFil kjører skriv mot stdout, eller mot en buffer som skrives til sti når
// skriv er ferdig uten feil, så en feilet kjøring ikke etterlater en halv fil.
func medUtFil(sti string, stdout, logg io.Writer, skriv func(io.Writer) error) error {
	if sti == "" {
		return skriv(stdout)
	}
	var buf bytes.Buffer
	if err := skriv(&buf); err != nil {
		return err
	}
	if err := os.WriteFile(sti, buf.Bytes(), 0o644); err != nil {
		return fmt.Errorf("skriv %s: %w", sti, err)
	}
	fmt.Fprintf(logg, "Skrev resultatet til %s\n", sti)
	return nil
}

// tallTekst gjør om et tall til tekst, med 0 som tom verdi.
func tallTekst[N ~uint32 | ~uint64](n N) string {
	if n == 0 {
		return ""
	}
	return fmt.Sprint(n)
}
