package cmd

// Felles utskrift for kommandoer som skriver rader: tekst, JSON eller CSV med
// valgfrie kolonner. Kolonnenavnene følger det kanoniske skjemaet i
// https://github.com/Altinn/altinn-platform-validation-tests/issues/323.

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"slices"
	"strings"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
)

const (
	formatTekst = "text"
	formatJSON  = "json"
	formatCSV   = "csv"
)

// utskriftValg er flaggene for utskrift.
type utskriftValg struct {
	// format er text, json eller csv. Tom betyr standard: text, eller json
	// med --json.
	format string
	// kolonner er kommaseparerte CSV-kolonner. Tom betyr kommandoens standard.
	kolonner string
	// ut er filen resultatet skrives til. Tom betyr stdout.
	ut string
}

func leggTilUtskriftFlagg(cmd *cobra.Command, v *utskriftValg, standardKolonner []string) {
	cmd.Flags().StringVar(
		&v.format, "format", "",
		"Utskrift: text, json eller csv (standard: text, eller json med --json)",
	)
	cmd.Flags().StringVar(
		&v.kolonner, "columns", "",
		"Kommaseparerte kolonner med --format csv (standard: "+strings.Join(standardKolonner, ",")+")",
	)
	cmd.Flags().StringVar(
		&v.ut, "out", "",
		"Fil resultatet skrives til (standard: stdout)",
	)
}

// effektivtFormat avgjør formatet når --format ikke er satt.
func (v utskriftValg) effektivtFormat(jsonOutput bool) string {
	switch {
	case v.format != "":
		return v.format
	case jsonOutput:
		return formatJSON
	default:
		return formatTekst
	}
}

// valider sjekker format og kolonner før noe hentes.
func validerUtskrift[T any](v utskriftValg, jsonOutput bool, alle []kolonne[T], standard []string) error {
	format := v.effektivtFormat(jsonOutput)
	if !slices.Contains([]string{formatTekst, formatJSON, formatCSV}, format) {
		return fmt.Errorf("%w: ukjent --format %q, bruk text, json eller csv", errs.Invalid, format)
	}
	if v.kolonner != "" && format != formatCSV {
		return fmt.Errorf("%w: --columns virker bare med --format csv", errs.Invalid)
	}
	if format == formatCSV {
		_, err := velgKolonner(alle, v.kolonner, standard)
		return err
	}
	return nil
}

// kolonne er en CSV-kolonne for rader av typen T.
type kolonne[T any] struct {
	navn  string
	verdi func(T) string
}

// velgKolonner slår opp kolonnene i spesifikasjon (kommaseparert), eller
// standard hvis den er tom.
func velgKolonner[T any](alle []kolonne[T], spesifikasjon string, standard []string) ([]kolonne[T], error) {
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
			return nil, fmt.Errorf("%w: ukjent kolonne %q, bruk en av %s", errs.Invalid, n, strings.Join(tilgjengelige, ","))
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

// brukerID, partyID og partyUUID henter ID-er fra en part, eller tom tekst
// når parten eller verdien mangler.
func brukerID(p *register.Party) string {
	if p == nil || p.User == nil {
		return ""
	}
	return tallTekst(p.User.UserID)
}

func partyID(p *register.Party) string {
	if p == nil {
		return ""
	}
	return tallTekst(p.PartyID)
}

func partyUUID(p *register.Party) string {
	if p == nil {
		return ""
	}
	return p.PartyUUID
}

func skrivJSON(ut io.Writer, v any) error {
	enc := json.NewEncoder(ut)
	enc.SetIndent("", "  ")
	return enc.Encode(v)
}
