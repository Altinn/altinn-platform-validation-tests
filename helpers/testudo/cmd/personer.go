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
	utskrift   utskriftValg
}

// standardPersonKolonner er CSV-kolonnene uten --kolonner.
var standardPersonKolonner = []string{"personIdentifier", "userId", "partyId", "partyUuid"}

// personKolonner er kolonnene en person kan skrives ut med i CSV. Navnene er
// feltnavnene i Register (Party).
var personKolonner = []kolonne[PersonMedAltinn]{
	{navn: "personIdentifier", verdi: func(p PersonMedAltinn) string { return p.Foedselsnummer }},
	{navn: "userId", register: true, verdi: func(p PersonMedAltinn) string { return brukerID(p.Altinn) }},
	{navn: "partyId", register: true, verdi: func(p PersonMedAltinn) string { return partyID(p.Altinn) }},
	{navn: "partyUuid", register: true, verdi: func(p PersonMedAltinn) string { return partyUUID(p.Altinn) }},
	{navn: "displayName", verdi: func(p PersonMedAltinn) string { return visningsnavn(p.Altinn, p.Navn) }},
	// Etternavnet fra Register når det finnes, ellers fra Tenor.
	{navn: "lastName", verdi: func(p PersonMedAltinn) string {
		if p.Altinn != nil && p.Altinn.LastName != "" {
			return p.Altinn.LastName
		}
		return p.Etternavn
	}},
	{navn: "firstName", verdi: func(p PersonMedAltinn) string {
		if p.Altinn != nil && p.Altinn.FirstName != "" {
			return p.Altinn.FirstName
		}
		return p.Fornavn
	}},
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
			if err := validerUtskrift(opts.utskrift, opts.jsonOutput, opts.register, personKolonner, standardPersonKolonner); err != nil {
				return err
			}
			// Register settes opp før Tenor, så feil i konfigurasjonen kommer
			// før vi henter noe.
			var reg *RegisterClient
			if opts.register {
				var err error
				if reg, err = nyRegisterKlient(opts.env); err != nil {
					return err
				}
			}
			c, err := nyTenorKlient()
			if err != nil {
				return err
			}
			logg := cmd.ErrOrStderr()
			return medUtFil(opts.utskrift.ut, cmd.OutOrStdout(), logg, func(ut io.Writer) error {
				return runPersoner(cmd.Context(), c, reg, ut, logg, opts)
			})
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
	leggTilUtskriftFlagg(cmd, &opts.utskrift, standardPersonKolonner)

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

// PersonMedAltinn er en person fra Tenor med parten fra Register. Altinn er
// null når personen ikke finnes i miljøet.
type PersonMedAltinn struct {
	Person
	Altinn            *Party `json:"altinn"`
	AltinnEnvironment string `json:"altinnEnvironment"`
}

// runPersoner skriver personene til ut og meldinger til logg, som i
// TS-versjonen: fnr per linje, fnr og navn med --navn, eller JSON med --json.
// Med --register får hver person parten fra Register (reg). Med --format csv
// skrives de valgte kolonnene.
func runPersoner(ctx context.Context, c *TenorClient, reg *RegisterClient, ut, logg io.Writer, opts *personerOptions) error {
	if opts.register && reg == nil {
		return fmt.Errorf("%w: --register krever en Register-klient", ErrInvalid)
	}
	format := opts.utskrift.effektivtFormat(opts.jsonOutput, opts.register)
	var kolonner []kolonne[PersonMedAltinn]
	if format == formatCSV {
		var err error
		if kolonner, err = velgKolonner(personKolonner, opts.utskrift.kolonner, standardPersonKolonner, opts.register); err != nil {
			return err
		}
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

	rader := make([]PersonMedAltinn, len(personer))
	for i, p := range personer {
		rader[i] = PersonMedAltinn{Person: p}
	}
	if opts.register {
		fnr := make([]string, len(personer))
		for i, p := range personer {
			fnr[i] = p.Foedselsnummer
		}
		parter, err := slaaOppIRegister(ctx, reg, fnr, opts.env, logg)
		if err != nil {
			return err
		}
		for i, p := range personer {
			rader[i].AltinnEnvironment = opts.env
			if party, ok := parter[p.Foedselsnummer]; ok {
				rader[i].Altinn = &party
			}
		}
	}

	switch format {
	case formatCSV:
		hoppetOver, err := skrivCSV(ut, rader, kolonner)
		if hoppetOver > 0 {
			fmt.Fprintf(logg, "Hoppet over %d personer som mangler verdier (f.eks. ikke i Register eller uten bruker).\n", hoppetOver)
		}
		return err
	case formatJSON:
		if opts.register {
			return skrivJSON(ut, rader)
		}
		return skrivJSON(ut, personer)
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
