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

	"github.com/spf13/cobra"
)

type virksomheterOptions struct {
	antall     int
	kql        string
	jsonOutput bool
	env        string
	// rolle er revisor, regnskapsfoerer eller forretningsfoerer. Tom betyr
	// vanlige virksomheter fra kql.
	rolle    string
	utskrift utskriftValg
}

// standardVirksomhetKolonner er CSV-kolonnene uten --kolonner.
var standardVirksomhetKolonner = []string{"organizationIdentifier", "displayName", "partyId", "partyUuid"}

// virksomhetKolonner er kolonnene en virksomhet kan skrives ut med i CSV.
// Virksomhetens egne kolonner har feltnavnene i Register (Party). ssn, userId,
// userPartyId, userPartyUuid og lastName er daglig leder.
var virksomhetKolonner = []kolonne[Virksomhet]{
	{navn: "organizationIdentifier", verdi: func(v Virksomhet) string { return v.Organisasjonsnummer }},
	{navn: "displayName", verdi: func(v Virksomhet) string { return cmp.Or(v.DisplayName, v.Navn) }},
	{navn: "partyId", verdi: func(v Virksomhet) string { return partyID(&v.Party) }},
	{navn: "partyUuid", verdi: func(v Virksomhet) string { return v.PartyUUID }},
	{navn: "unitType", verdi: func(v Virksomhet) string { return v.Organisasjonsform }},
	{navn: "type", verdi: func(v Virksomhet) string { return v.Rolle }},
	{navn: "ssn", verdi: func(v Virksomhet) string { return v.DagligLeder }},
	{navn: "userId", verdi: func(v Virksomhet) string { return brukerID(v.DagligLederParty) }},
	{navn: "userPartyId", verdi: func(v Virksomhet) string { return partyID(v.DagligLederParty) }},
	{navn: "userPartyUuid", verdi: func(v Virksomhet) string { return partyUUID(v.DagligLederParty) }},
	{navn: "lastName", verdi: func(v Virksomhet) string {
		if v.DagligLederParty == nil {
			return ""
		}
		return v.DagligLederParty.LastName
	}},
}

// valider sjekker flaggene før noe hentes. kqlSatt er om --kql ble oppgitt.
func (o *virksomheterOptions) valider(kqlSatt bool) error {
	if o.antall < 1 {
		return fmt.Errorf("%w: --antall må være minst 1", ErrInvalid)
	}
	if o.rolle == "" {
		return nil
	}
	if _, err := finnTilretteleggerRolle(o.rolle); err != nil {
		return err
	}
	if kqlSatt {
		return fmt.Errorf("%w: --kql og --rolle kan ikke brukes sammen", ErrInvalid)
	}
	return nil
}

func newVirksomheterCmd() *cobra.Command {
	opts := &virksomheterOptions{}

	cmd := &cobra.Command{
		Use:   "virksomheter",
		Short: "Hent virksomheter fra Tenor i bulk",
		Long: `Hent virksomheter med daglig leder eller innehaver fra Tenor.

Uten --rolle hentes aksjeselskaper. Med --rolle hentes revisorer,
regnskapsførere eller forretningsførere.`,
		Example: `  testudo tenor virksomheter -n 10
  testudo tenor virksomheter --rolle regnskapsfoerer -n 5 --format csv`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := opts.valider(cmd.Flags().Changed("kql")); err != nil {
				return err
			}
			if err := validerUtskrift(opts.utskrift, opts.jsonOutput, virksomhetKolonner, standardVirksomhetKolonner); err != nil {
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
				return runVirksomheter(cmd.Context(), c, reg, ut, logg, opts)
			})
		},
	}

	cmd.Flags().IntVarP(
		&opts.antall, "antall", "n", 10,
		"Antall virksomheter som hentes",
	)
	cmd.Flags().StringVarP(
		&opts.rolle, "rolle", "r", "",
		"Hent tilretteleggere: "+rolleNavn(),
	)
	cmd.Flags().StringVar(
		&opts.kql, "kql", standardVirksomhetKQL,
		"Egendefinert KQL, for de som kjenner Tenor (kan ikke brukes med --rolle)",
	)
	cmd.Flags().BoolVar(
		&opts.jsonOutput, "json", false,
		"Skriv ut som JSON, med partene fra Register",
	)
	cmd.Flags().StringVar(
		&opts.env, "env", "tt02",
		"Miljø: tt02, at22, at23, yt01 (seksjon i config-fila)",
	)
	leggTilUtskriftFlagg(cmd, &opts.utskrift, standardVirksomhetKolonner)

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
	DagligLeder string `json:"dagligLeder,omitempty"`
	// Rolle er tilretteleggerrollen med --rolle.
	Rolle string `json:"rolle,omitempty"`
	// Kildedata er hele brreg-dokumentet.
	Kildedata json.RawMessage `json:"kildedata,omitempty"`
	// Party er virksomheten i Register. Virksomheter som ikke finnes i Register
	// for miljøet blir ikke med, så den er alltid satt. I JSON ligger feltene
	// fra Register på samme nivå som feltene fra Tenor.
	Party
	// DagligLederParty er daglig leder i Register. Virksomheter der daglig
	// leder ikke finnes i Register blir ikke med, så den er alltid satt.
	DagligLederParty *Party `json:"dagligLederParty,omitempty"`
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
		// Virksomhet er satt når rollen holdes av en virksomhet, f.eks. en
		// revisor.
		Virksomhet struct {
			Organisasjonsnummer string `json:"organisasjonsnummer"`
		} `json:"virksomhet"`
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
// navn og daglig leder per linje, eller JSON med --json. Med --rolle hentes
// tilretteleggere i stedet. Hver virksomhet og daglig leder får parten fra
// Register (reg). Med --format csv skrives de valgte kolonnene.
func runVirksomheter(ctx context.Context, c *TenorClient, reg *RegisterClient, ut, logg io.Writer, opts *virksomheterOptions) error {
	if reg == nil {
		return fmt.Errorf("%w: mangler Register-klient", ErrInvalid)
	}
	format := opts.utskrift.effektivtFormat(opts.jsonOutput)
	var kolonner []kolonne[Virksomhet]
	if format == formatCSV {
		var err error
		if kolonner, err = velgKolonner(virksomhetKolonner, opts.utskrift.kolonner, standardVirksomhetKolonner); err != nil {
			return err
		}
	}

	if opts.rolle == "" {
		kql := cmp.Or(opts.kql, standardVirksomhetKQL)
		fmt.Fprintf(logg, "Henter %d virksomheter fra Tenor med KQL: %s\n", opts.antall, kql)
	} else {
		rolle, err := finnTilretteleggerRolle(opts.rolle)
		if err != nil {
			return err
		}
		fmt.Fprintf(logg, "Henter %d %s-virksomheter fra Tenor via klientene (%s)\n", opts.antall, rolle.navn, Finnes(rolle.felt))
	}

	virksomheter, err := hentVirksomheterMedRegister(ctx, c, reg, logg, opts)
	if err != nil {
		return err
	}
	if len(virksomheter) == 0 {
		return fmt.Errorf("%w: ingen treff som finnes i Register for %s", ErrNotFound, opts.env)
	}
	if len(virksomheter) < opts.antall {
		fmt.Fprintf(logg, "Advarsel: fant bare %d av %d ønskede virksomheter.\n", len(virksomheter), opts.antall)
	}

	switch format {
	case formatCSV:
		hoppetOver, err := skrivCSV(ut, virksomheter, kolonner)
		if hoppetOver > 0 {
			fmt.Fprintf(logg, "Hoppet over %d rader som mangler verdier (f.eks. daglig leder uten bruker).\n", hoppetOver)
		}
		if err != nil {
			return err
		}
	case formatJSON:
		if err := skrivJSON(ut, virksomheter); err != nil {
			return err
		}
	default:
		skrivVirksomheterTekst(ut, virksomheter)
	}
	fmt.Fprintf(logg, "-> %d virksomheter\n", len(virksomheter))
	return nil
}

// hentForValg henter antall virksomheter fra Tenor etter flaggene: vanlige
// virksomheter fra kql, eller tilretteleggere med --rolle. Ingenting er slått
// opp i Register ennå.
func hentForValg(ctx context.Context, c *TenorClient, logg io.Writer, opts *virksomheterOptions, antall int) ([]Virksomhet, error) {
	if opts.rolle == "" {
		return hentVirksomheter(ctx, c, cmp.Or(opts.kql, standardVirksomhetKQL), antall)
	}

	rolle, err := finnTilretteleggerRolle(opts.rolle)
	if err != nil {
		return nil, err
	}
	return hentTilretteleggere(ctx, c, rolle, antall)
}

// hentVirksomheterMedRegister henter opts.antall virksomheter der både
// virksomheten og daglig leder finnes i Register for opts.env. Andre byttes ut
// med nye fra Tenor, i opptil maksRegisterRunder runder. Virksomhetene og
// daglige ledere i en runde slås opp i samme kall.
func hentVirksomheterMedRegister(ctx context.Context, c *TenorClient, reg *RegisterClient, logg io.Writer, opts *virksomheterOptions) ([]Virksomhet, error) {
	sett := map[string]bool{}
	virksomheter := make([]Virksomhet, 0, opts.antall)
	ikkeIRegister := 0
	for runde := 0; runde < maksRegisterRunder && len(virksomheter) < opts.antall; runde++ {
		kandidater, err := hentForValg(ctx, c, logg, opts, opts.antall-len(virksomheter))
		if err != nil {
			return nil, err
		}
		var nye []Virksomhet
		for _, v := range kandidater {
			if !sett[v.Organisasjonsnummer] {
				sett[v.Organisasjonsnummer] = true
				nye = append(nye, v)
			}
		}
		if len(nye) == 0 {
			break
		}

		ider := make([]string, 0, 2*len(nye))
		for _, v := range nye {
			ider = append(ider, v.Organisasjonsnummer, v.DagligLeder)
		}
		parter, err := reg.SlaaOppIdentifikatorer(ctx, ider, registerFelt...)
		if err != nil {
			return nil, err
		}

		for _, v := range nye {
			party, funnet := parter[v.Organisasjonsnummer]
			leder, lederFunnet := parter[v.DagligLeder]
			if !funnet || !lederFunnet {
				ikkeIRegister++
				continue
			}
			v.Party, v.DagligLederParty = party, &leder
			virksomheter = append(virksomheter, v)
			if len(virksomheter) == opts.antall {
				break
			}
		}
	}
	if ikkeIRegister > 0 {
		fmt.Fprintf(logg, "Register (%s): %d virksomheter fra Tenor, eller daglig leder for dem, finnes ikke og er byttet ut.\n", opts.env, ikkeIRegister)
	}
	return virksomheter, nil
}

// skrivVirksomheterTekst skriver orgnr, navn og daglig leder per linje, med
// rolle når den er satt.
func skrivVirksomheterTekst(ut io.Writer, virksomheter []Virksomhet) {
	for _, v := range virksomheter {
		felt := []string{v.Organisasjonsnummer, v.Navn, v.DagligLeder}
		if v.Rolle != "" {
			felt = append(felt, v.Rolle)
		}
		fmt.Fprintln(ut, strings.Join(felt, "\t"))
	}
}

func init() {
	tenorCmd.AddCommand(newVirksomheterCmd())
}
