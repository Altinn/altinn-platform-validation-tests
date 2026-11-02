/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"cmp"
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
	jsonOutput bool
	env        string
	utskrift   utskriftValg
}

// standardPersonKolonner er CSV-kolonnene uten --kolonner.
var standardPersonKolonner = []string{"personIdentifier", "userId", "partyId", "partyUuid"}

// personKolonner er kolonnene en person kan skrives ut med i CSV. Navnene er
// feltnavnene i Register (Party).
var personKolonner = []kolonne[Person]{
	{navn: "personIdentifier", verdi: func(p Person) string { return p.Foedselsnummer }},
	{navn: "userId", verdi: func(p Person) string { return brukerID(&p.Party) }},
	{navn: "partyId", verdi: func(p Person) string { return partyID(&p.Party) }},
	{navn: "partyUuid", verdi: func(p Person) string { return p.PartyUUID }},
	// Navnene fra Register når de finnes, ellers fra Tenor.
	{navn: "displayName", verdi: func(p Person) string { return cmp.Or(p.DisplayName, p.Navn) }},
	{navn: "lastName", verdi: func(p Person) string { return cmp.Or(p.LastName, p.Etternavn) }},
	{navn: "firstName", verdi: func(p Person) string { return cmp.Or(p.FirstName, p.Fornavn) }},
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
			if err := validerUtskrift(opts.utskrift, opts.jsonOutput, personKolonner, standardPersonKolonner); err != nil {
				return err
			}
			// Register settes opp før Tenor, så feil i konfigurasjonen kommer
			// før vi henter noe.
			reg, err := nyRegisterKlient(opts.env)
			if err != nil {
				return err
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
		&opts.jsonOutput, "json", false,
		"Skriv ut full kildedata og parten fra Register som JSON",
	)
	cmd.Flags().StringVar(
		&opts.env, "env", "tt02",
		"Miljø: tt02, at22, at23, yt01 (seksjon i config-fila)",
	)
	leggTilUtskriftFlagg(cmd, &opts.utskrift, standardPersonKolonner)

	return cmd
}

// Person er en testperson fra freg med parten fra Register. Personer som ikke
// finnes i Register for miljøet blir ikke med, så Party er alltid satt. I JSON
// ligger feltene fra Register (partyUuid, partyId, user og så videre) på samme
// nivå som feltene fra Tenor.
type Person struct {
	Foedselsnummer string `json:"foedselsnummer"`
	Fornavn        string `json:"fornavn,omitempty"`
	Mellomnavn     string `json:"mellomnavn,omitempty"`
	Etternavn      string `json:"etternavn,omitempty"`
	// Navn er fornavn, mellomnavn og etternavn med mellomrom.
	Navn string `json:"navn,omitempty"`
	// Kildedata er hele freg-dokumentet.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
	Party
}

var foedselsnummerRe = regexp.MustCompile(`^\d{11}$`)

// maksRegisterRunder er hvor mange ganger det hentes nye kandidater fra Tenor
// når noen ikke finnes i Register.
const maksRegisterRunder = 5

// hentPersoner henter antall unike testpersoner fra freg som matcher kql, uten
// parten fra Register. Tom kql gir bosatte, myndige personer.
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

// hentPersonerMedRegister henter antall personer som finnes både i Tenor og i
// Register for miljoe. Personer som ikke finnes i Register byttes ut med nye
// fra Tenor, i opptil maksRegisterRunder runder.
func hentPersonerMedRegister(ctx context.Context, c *TenorClient, reg *RegisterClient, kql string, antall int, miljoe string, logg io.Writer) ([]Person, error) {
	sett := map[string]bool{}
	personer := make([]Person, 0, antall)
	ikkeIRegister := 0
	for runde := 0; runde < maksRegisterRunder && len(personer) < antall; runde++ {
		kandidater, err := hentPersoner(ctx, c, kql, antall-len(personer))
		if err != nil {
			return nil, err
		}
		var nye []Person
		for _, p := range kandidater {
			if !sett[p.Foedselsnummer] {
				sett[p.Foedselsnummer] = true
				nye = append(nye, p)
			}
		}
		if len(nye) == 0 {
			break
		}

		fnr := make([]string, len(nye))
		for i, p := range nye {
			fnr[i] = p.Foedselsnummer
		}
		parter, err := reg.SlaaOppIdentifikatorer(ctx, fnr, registerFelt...)
		if err != nil {
			return nil, err
		}
		for _, p := range nye {
			party, ok := parter[p.Foedselsnummer]
			if !ok {
				ikkeIRegister++
				continue
			}
			p.Party = party
			personer = append(personer, p)
			if len(personer) == antall {
				break
			}
		}
	}
	if ikkeIRegister > 0 {
		fmt.Fprintf(logg, "Register (%s): %d personer fra Tenor finnes ikke og er byttet ut.\n", miljoe, ikkeIRegister)
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
// Bare personer som finnes i Register (reg) blir med. Med --format csv skrives
// de valgte kolonnene.
func runPersoner(ctx context.Context, c *TenorClient, reg *RegisterClient, ut, logg io.Writer, opts *personerOptions) error {
	if reg == nil {
		return fmt.Errorf("%w: mangler Register-klient", ErrInvalid)
	}
	format := opts.utskrift.effektivtFormat(opts.jsonOutput)
	var kolonner []kolonne[Person]
	if format == formatCSV {
		var err error
		if kolonner, err = velgKolonner(personKolonner, opts.utskrift.kolonner, standardPersonKolonner); err != nil {
			return err
		}
	}

	kql := opts.kql
	if kql == "" {
		kql = BosattMyndigKQL(time.Now())
	}
	fmt.Fprintf(logg, "Henter %d person(er) fra Tenor med KQL: %s\n", opts.antall, kql)

	personer, err := hentPersonerMedRegister(ctx, c, reg, kql, opts.antall, opts.env, logg)
	if err != nil {
		return err
	}
	if len(personer) == 0 {
		return fmt.Errorf("%w: ingen treff som finnes i Register for %s", ErrNotFound, opts.env)
	}
	if len(personer) < opts.antall {
		fmt.Fprintf(logg, "Advarsel: fant bare %d av %d ønskede personer.\n", len(personer), opts.antall)
	}

	switch format {
	case formatCSV:
		hoppetOver, err := skrivCSV(ut, personer, kolonner)
		if hoppetOver > 0 {
			fmt.Fprintf(logg, "Hoppet over %d personer som mangler verdier (f.eks. uten bruker).\n", hoppetOver)
		}
		return err
	case formatJSON:
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
