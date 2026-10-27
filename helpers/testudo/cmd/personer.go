/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"regexp"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

type personerOptions struct {
	antall     int
	kql        string
	navn       bool
	register   bool
	jsonOutput bool
	env        string
}

func newPersonerCmd() *cobra.Command {
	opts := &personerOptions{}

	cmd := &cobra.Command{
		Use:   "personer",
		Short: "Hent testpersoner fra Tenor",
		RunE: func(cmd *cobra.Command, args []string) error {
			if opts.antall < 1 {
				return fmt.Errorf("%w: --antall må være minst 1", ErrInvalid)
			}
			c, err := nyTenorKlient()
			if err != nil {
				return err
			}
			return runPersoner(cmd.Context(), c, cmd.OutOrStdout(), cmd.ErrOrStderr(), opts)
		},
	}

	cmd.Flags().IntVarP(
		&opts.antall, "antall", "n", 1,
		"Antall personer som hentes",
	)
	cmd.Flags().StringVar(
		&opts.kql, "kql", "",
		"Egendefinert KQL (default: bosatt + myndig)",
	)
	cmd.Flags().BoolVar(
		&opts.navn, "navn", false,
		"Skriv ut navn (fornavn etternavn) ved siden av fnr",
	)
	cmd.Flags().BoolVar(
		&opts.register, "register", false,
		"Berik med Altinn-ID-er fra Register (impliserer JSON)",
	)
	cmd.Flags().BoolVar(
		&opts.jsonOutput, "json", false,
		"Skriv ut full kildedata som JSON",
	)
	cmd.Flags().StringVar(
		&opts.env, "env", "tt02",
		"Miljø for env-fil: tt02, at22, at23",
	)

	return cmd
}

// Person er en testperson fra freg.
type Person struct {
	Foedselsnummer string `json:"foedselsnummer"`
	Fornavn        string `json:"fornavn,omitempty"`
	Mellomnavn     string `json:"mellomnavn,omitempty"`
	Etternavn      string `json:"etternavn,omitempty"`
	// Navn er fornavn, mellomnavn og etternavn med mellomrom.
	Navn string `json:"navn,omitempty"`
	// Kildedata er hele freg-dokumentet.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
}

var foedselsnummerRe = regexp.MustCompile(`^\d{11}$`)

// hentPersoner henter antall unike testpersoner fra freg som matcher kql.
// Tom kql gir bosatte, myndige personer.
func hentPersoner(ctx context.Context, c *TenorClient, kql string, antall int) ([]Person, error) {
	if kql == "" {
		kql = BosattMyndigKQL(time.Now())
	}
	dokumenter, err := c.HentMange(ctx, KildeFreg, kql, antall)
	if err != nil {
		return nil, err
	}
	personer := make([]Person, 0, len(dokumenter))
	for _, md := range dokumenter {
		if p, ok := tilPerson(md); ok {
			personer = append(personer, p)
		}
	}
	return personer, nil
}

// tilPerson gjør om et freg-dokument til en Person. Dokumenter uten gyldig
// fødselsnummer hoppes over.
func tilPerson(md TenorMetadata) (Person, bool) {
	if !foedselsnummerRe.MatchString(md.ID) {
		return Person{}, false
	}
	p := Person{Foedselsnummer: md.ID}

	var kildedata struct {
		Navn []struct {
			Fornavn     string `json:"fornavn"`
			Mellomnavn  string `json:"mellomnavn"`
			Etternavn   string `json:"etternavn"`
			ErGjeldende bool   `json:"erGjeldende"`
		} `json:"navn"`
	}
	if err := json.Unmarshal([]byte(md.Kildedata), &kildedata); err != nil {
		return p, true
	}
	p.Kildedata = json.RawMessage(md.Kildedata)

	// Bruk gjeldende navn, ellers det første.
	for i, n := range kildedata.Navn {
		if i == 0 || n.ErGjeldende {
			p.Fornavn, p.Mellomnavn, p.Etternavn = n.Fornavn, n.Mellomnavn, n.Etternavn
		}
		if n.ErGjeldende {
			break
		}
	}
	p.Navn = strings.Join(strings.Fields(p.Fornavn+" "+p.Mellomnavn+" "+p.Etternavn), " ")
	return p, true
}

// runPersoner skriver personene til ut og meldinger til logg, som i
// TS-versjonen: fnr per linje, fnr og navn med --navn, eller JSON med --json.
func runPersoner(ctx context.Context, c *TenorClient, ut, logg io.Writer, opts *personerOptions) error {
	if opts.register {
		return fmt.Errorf("--register er ikke støttet ennå")
	}

	kql := opts.kql
	if kql == "" {
		kql = BosattMyndigKQL(time.Now())
	}
	fmt.Fprintf(logg, "Henter %d person(er) fra Tenor med KQL: %s\n", opts.antall, kql)

	personer, err := hentPersoner(ctx, c, kql, opts.antall)
	if err != nil {
		return err
	}
	if len(personer) == 0 {
		return fmt.Errorf("%w: ingen treff", ErrNotFound)
	}
	if len(personer) < opts.antall {
		fmt.Fprintf(logg, "Advarsel: fant bare %d av %d ønskede personer.\n", len(personer), opts.antall)
	}

	if opts.jsonOutput {
		enc := json.NewEncoder(ut)
		enc.SetIndent("", "  ")
		return enc.Encode(personer)
	}
	for _, p := range personer {
		if opts.navn {
			fmt.Fprintf(ut, "%s\t%s\n", p.Foedselsnummer, p.Navn)
		} else {
			fmt.Fprintln(ut, p.Foedselsnummer)
		}
	}
	return nil
}

func init() {
	tenorCmd.AddCommand(newPersonerCmd())
}
