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

	"github.com/spf13/cobra"
)

type virksomheterOptions struct {
	antall     int
	kql        string
	register   bool
	jsonOutput bool
	env        string
}

func newVirksomheterCmd() *cobra.Command {
	opts := &virksomheterOptions{}

	cmd := &cobra.Command{
		Use:   "virksomheter",
		Short: "Hent virksomheter fra Tenor i bulk",
		RunE: func(cmd *cobra.Command, args []string) error {
			if opts.antall < 1 {
				return fmt.Errorf("%w: --antall må være minst 1", ErrInvalid)
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
			return runVirksomheter(cmd.Context(), c, reg, cmd.OutOrStdout(), cmd.ErrOrStderr(), opts)
		},
	}

	cmd.Flags().IntVarP(
		&opts.antall, "antall", "n", 10,
		"Antall virksomheter som hentes",
	)
	cmd.Flags().StringVar(
		&opts.kql, "kql", "organisasjonsform.kode:AS",
		"Egendefinert KQL",
	)
	cmd.Flags().BoolVar(
		&opts.register, "register", false,
		"Berik med Altinn-ID-er fra Register (impliserer JSON)",
	)
	cmd.Flags().BoolVar(
		&opts.jsonOutput, "json", false,
		"Skriv ut som JSON",
	)
	cmd.Flags().StringVar(
		&opts.env, "env", "tt02",
		"Miljø for env-fil: tt02, at22, at23",
	)

	return cmd
}

// standardVirksomhetKQL gir aksjeselskaper, som i TS-versjonen.
const standardVirksomhetKQL = "organisasjonsform.kode:AS"

// Virksomhet er en virksomhet fra brreg-er-fr.
type Virksomhet struct {
	Organisasjonsnummer string `json:"organisasjonsnummer"`
	Navn                string `json:"navn"`
	// Organisasjonsform er koden, f.eks. AS eller ENK.
	Organisasjonsform string `json:"organisasjonsform,omitempty"`
	// DagligLeder er fødselsnummeret til daglig leder, eller innehaver for
	// enkeltpersonforetak.
	DagligLeder string `json:"dagligLeder"`
	// Kildedata er hele brreg-dokumentet.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
}

// VirksomhetMedAltinn er en virksomhet fra Tenor med parten fra Register.
// Altinn er null når virksomheten ikke finnes i miljøet.
type VirksomhetMedAltinn struct {
	Virksomhet
	Altinn            *Party `json:"altinn"`
	AltinnEnvironment string `json:"altinnEnvironment"`
	// DagligLederAltinn er parten til daglig leder, eller null.
	DagligLederAltinn *Party `json:"dagligLederAltinn"`
}

var organisasjonsnummerRe = regexp.MustCompile(`^\d{9}$`)

// rollegruppe er en gruppe i rollegrupper i et brreg-dokument.
type rollegruppe struct {
	Type struct {
		Kode string `json:"kode"`
	} `json:"type"`
	Roller []struct {
		Person struct {
			Foedselsnummer string `json:"foedselsnummer"`
		} `json:"person"`
		// Fratraadt er "J" eller "N".
		Fratraadt string `json:"fratraadt"`
	} `json:"roller"`
}

// dagligLeder returnerer fødselsnummeret til daglig leder (DAGL), eller til
// innehaver (INNH) hvis det ikke finnes noen daglig leder. Fratrådte roller
// og roller uten fødselsnummer hoppes over.
func dagligLeder(grupper []rollegruppe) string {
	for _, kode := range []string{"DAGL", "INNH"} {
		for _, g := range grupper {
			if g.Type.Kode != kode {
				continue
			}
			for _, r := range g.Roller {
				if r.Fratraadt != "J" && foedselsnummerRe.MatchString(r.Person.Foedselsnummer) {
					return r.Person.Foedselsnummer
				}
			}
		}
	}
	return ""
}

// hentVirksomheter henter antall unike virksomheter fra brreg-er-fr som
// matcher kql og har daglig leder eller innehaver. Tom kql gir
// aksjeselskaper.
func hentVirksomheter(ctx context.Context, c *TenorClient, kql string, antall int) ([]Virksomhet, error) {
	if kql == "" {
		kql = standardVirksomhetKQL
	}
	// Roller kan ikke søkes på i KQL, så kravet om daglig leder sjekkes her.
	harDagligLeder := func(md TenorMetadata) bool {
		v, ok := tilVirksomhet(md)
		return ok && v.DagligLeder != ""
	}
	dokumenter, err := c.HentMangeFiltrert(ctx, KildeBrreg, kql, antall, harDagligLeder)
	if err != nil {
		return nil, err
	}
	virksomheter := make([]Virksomhet, 0, len(dokumenter))
	for _, md := range dokumenter {
		if v, ok := tilVirksomhet(md); ok {
			virksomheter = append(virksomheter, v)
		}
	}
	return virksomheter, nil
}

// tilVirksomhet gjør om et brreg-dokument til en Virksomhet. Dokumenter uten
// gyldig organisasjonsnummer hoppes over.
func tilVirksomhet(md TenorMetadata) (Virksomhet, bool) {
	var kildedata struct {
		Organisasjonsnummer string `json:"organisasjonsnummer"`
		Navn                string `json:"navn"`
		Organisasjonsform   struct {
			Kode string `json:"kode"`
		} `json:"organisasjonsform"`
		Rollegrupper []rollegruppe `json:"rollegrupper"`
	}
	gyldigJSON := json.Unmarshal([]byte(md.Kildedata), &kildedata) == nil

	orgnr := md.ID
	if !organisasjonsnummerRe.MatchString(orgnr) {
		orgnr = kildedata.Organisasjonsnummer
	}
	if !organisasjonsnummerRe.MatchString(orgnr) {
		return Virksomhet{}, false
	}

	v := Virksomhet{
		Organisasjonsnummer: orgnr,
		// Fjerner linjeskift, så ett navn ikke blir flere linjer i utskriften.
		Navn:              strings.Join(strings.Fields(kildedata.Navn), " "),
		Organisasjonsform: kildedata.Organisasjonsform.Kode,
		DagligLeder:       dagligLeder(kildedata.Rollegrupper),
	}
	if gyldigJSON {
		v.Kildedata = json.RawMessage(md.Kildedata)
	}
	return v, true
}

// runVirksomheter skriver virksomhetene til ut og meldinger til logg: orgnr,
// navn og daglig leder per linje, eller JSON med --json. Med --register skrives
// JSON der hver virksomhet og daglig leder har parten fra Register (reg).
func runVirksomheter(ctx context.Context, c *TenorClient, reg *RegisterClient, ut, logg io.Writer, opts *virksomheterOptions) error {
	if opts.register && reg == nil {
		return fmt.Errorf("%w: --register krever en Register-klient", ErrInvalid)
	}

	kql := opts.kql
	if kql == "" {
		kql = standardVirksomhetKQL
	}
	fmt.Fprintf(logg, "Henter %d virksomheter fra Tenor med KQL: %s\n", opts.antall, kql)

	virksomheter, err := hentVirksomheter(ctx, c, kql, opts.antall)
	if err != nil {
		return err
	}
	if len(virksomheter) == 0 {
		return fmt.Errorf("%w: ingen treff", ErrNotFound)
	}
	if len(virksomheter) < opts.antall {
		fmt.Fprintf(logg, "Advarsel: fant bare %d av %d ønskede virksomheter.\n", len(virksomheter), opts.antall)
	}

	switch {
	case opts.register:
		// Virksomhetene og daglige ledere slås opp i samme kall.
		ider := make([]string, 0, 2*len(virksomheter))
		for _, v := range virksomheter {
			ider = append(ider, v.Organisasjonsnummer, v.DagligLeder)
		}
		parter, err := slaaOppIRegister(ctx, reg, ider, opts.env, logg)
		if err != nil {
			return err
		}
		rader := make([]VirksomhetMedAltinn, len(virksomheter))
		for i, v := range virksomheter {
			rader[i] = VirksomhetMedAltinn{Virksomhet: v, AltinnEnvironment: opts.env}
			if party, ok := parter[v.Organisasjonsnummer]; ok {
				rader[i].Altinn = &party
			}
			if party, ok := parter[v.DagligLeder]; ok {
				rader[i].DagligLederAltinn = &party
			}
		}
		if err := skrivJSON(ut, rader); err != nil {
			return err
		}
	case opts.jsonOutput:
		if err := skrivJSON(ut, virksomheter); err != nil {
			return err
		}
	default:
		for _, v := range virksomheter {
			fmt.Fprintf(ut, "%s\t%s\t%s\n", v.Organisasjonsnummer, v.Navn, v.DagligLeder)
		}
	}
	fmt.Fprintf(logg, "-> %d virksomheter\n", len(virksomheter))
	return nil
}

func init() {
	tenorCmd.AddCommand(newVirksomheterCmd())

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// virksomheterCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// virksomheterCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
