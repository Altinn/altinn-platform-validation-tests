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
	// rolle er revisor, regnskapsfoerer eller forretningsfoerer. Tom betyr
	// vanlige virksomheter fra kql.
	rolle string
	// klienter er hvor mange klienter som tas med per tilrettelegger.
	klienter int
	// maksKlienter gir bare tilretteleggere med 1 til maksKlienter klienter.
	maksKlienter int
	utskrift     utskriftValg
}

// standardVirksomhetKolonner er CSV-kolonnene uten --kolonner.
var standardVirksomhetKolonner = []string{"organizationIdentifier", "displayName", "partyId", "partyUuid"}

// standardKlientKolonner legges til standardkolonnene med --klienter.
var standardKlientKolonner = []string{"clientOrganizationIdentifier", "clientDisplayName", "clientPartyId", "clientPartyUuid"}

// virksomhetRad er én rad i CSV: en virksomhet, og med --klienter én av
// klientene, så hver kombinasjon blir en egen rad.
type virksomhetRad struct {
	VirksomhetMedAltinn
	Klient *KlientMedAltinn
}

// virksomhetKolonner er kolonnene en virksomhet kan skrives ut med i CSV.
// Virksomhetens egne kolonner har feltnavnene i Register (Party). ssn, userId,
// userPartyId, userPartyUuid og lastName er daglig leder, og client* er
// klienten.
var virksomhetKolonner = []kolonne[virksomhetRad]{
	{navn: "organizationIdentifier", verdi: func(r virksomhetRad) string { return r.Organisasjonsnummer }},
	{navn: "displayName", verdi: func(r virksomhetRad) string { return visningsnavn(r.Altinn, r.Navn) }},
	{navn: "partyId", register: true, verdi: func(r virksomhetRad) string { return partyID(r.Altinn) }},
	{navn: "partyUuid", register: true, verdi: func(r virksomhetRad) string { return partyUUID(r.Altinn) }},
	{navn: "unitType", verdi: func(r virksomhetRad) string { return r.Organisasjonsform }},
	{navn: "type", verdi: func(r virksomhetRad) string { return r.Rolle }},
	{navn: "clientCount", verdi: func(r virksomhetRad) string { return tallTekst(uint64(r.AntallKlienter)) }},
	{navn: "ssn", verdi: func(r virksomhetRad) string { return r.DagligLeder }},
	{navn: "userId", register: true, verdi: func(r virksomhetRad) string { return brukerID(r.DagligLederAltinn) }},
	{navn: "userPartyId", register: true, verdi: func(r virksomhetRad) string { return partyID(r.DagligLederAltinn) }},
	{navn: "userPartyUuid", register: true, verdi: func(r virksomhetRad) string { return partyUUID(r.DagligLederAltinn) }},
	{navn: "lastName", register: true, verdi: func(r virksomhetRad) string {
		if r.DagligLederAltinn == nil {
			return ""
		}
		return r.DagligLederAltinn.LastName
	}},
	{navn: "clientOrganizationIdentifier", verdi: func(r virksomhetRad) string {
		if r.Klient == nil {
			return ""
		}
		return r.Klient.Organisasjonsnummer
	}},
	{navn: "clientDisplayName", verdi: func(r virksomhetRad) string {
		if r.Klient == nil {
			return ""
		}
		return visningsnavn(r.Klient.Altinn, r.Klient.Navn)
	}},
	{navn: "clientPartyId", register: true, verdi: func(r virksomhetRad) string {
		if r.Klient == nil {
			return ""
		}
		return partyID(r.Klient.Altinn)
	}},
	{navn: "clientPartyUuid", register: true, verdi: func(r virksomhetRad) string {
		if r.Klient == nil {
			return ""
		}
		return partyUUID(r.Klient.Altinn)
	}},
}

// standardKolonner er CSV-kolonnene uten --kolonner, med klientkolonnene når
// klienter tas med.
func (o *virksomheterOptions) standardKolonner() []string {
	if o.klienter > 0 {
		return append(append([]string{}, standardVirksomhetKolonner...), standardKlientKolonner...)
	}
	return standardVirksomhetKolonner
}

// valider sjekker flaggene før noe hentes. kqlSatt er om --kql ble oppgitt.
func (o *virksomheterOptions) valider(kqlSatt bool) error {
	if o.antall < 1 {
		return fmt.Errorf("%w: --antall må være minst 1", ErrInvalid)
	}
	if o.rolle == "" {
		if o.klienter != 0 || o.maksKlienter != 0 {
			return fmt.Errorf("%w: --klienter og --maks-klienter krever --rolle", ErrInvalid)
		}
		return nil
	}
	if _, err := finnTilretteleggerRolle(o.rolle); err != nil {
		return err
	}
	if kqlSatt {
		return fmt.Errorf("%w: --kql og --rolle kan ikke brukes sammen", ErrInvalid)
	}
	if o.klienter < 0 || o.klienter > TenorMaksPerSide {
		return fmt.Errorf("%w: --klienter må være mellom 0 og %d", ErrInvalid, TenorMaksPerSide)
	}
	if o.maksKlienter < 0 {
		return fmt.Errorf("%w: --maks-klienter kan ikke være negativ", ErrInvalid)
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
regnskapsførere eller forretningsførere, valgfritt med klientene sine.`,
		Example: `  testudo tenor virksomheter -n 10
  testudo tenor virksomheter --rolle regnskapsfoerer -n 5 --register --format csv
  testudo tenor virksomheter --rolle revisor -n 1 --klienter 5
  testudo tenor virksomheter --rolle revisor -n 1 --maks-klienter 10 --klienter 10`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := opts.valider(cmd.Flags().Changed("kql")); err != nil {
				return err
			}
			if err := validerUtskrift(opts.utskrift, opts.jsonOutput, opts.register, virksomhetKolonner, opts.standardKolonner()); err != nil {
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
	cmd.Flags().IntVar(
		&opts.klienter, "klienter", 0,
		"Ta med opptil så mange klienter per tilrettelegger (krever --rolle)",
	)
	cmd.Flags().IntVar(
		&opts.maksKlienter, "maks-klienter", 0,
		"Bare tilretteleggere med 1 til så mange klienter, færrest først (krever --rolle)",
	)
	cmd.Flags().StringVar(
		&opts.kql, "kql", standardVirksomhetKQL,
		"Egendefinert KQL, for de som kjenner Tenor (kan ikke brukes med --rolle)",
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
	DagligLeder string `json:"dagligLeder"`
	// Rolle er tilretteleggerrollen med --rolle.
	Rolle string `json:"rolle,omitempty"`
	// AntallKlienter er satt med --maks-klienter.
	AntallKlienter int64 `json:"antallKlienter,omitempty"`
	// Klienter er satt med --klienter.
	Klienter []Virksomhet `json:"klienter,omitempty"`
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
	// Klienter erstatter Virksomhet.Klienter i JSON, siden et felt på dette
	// nivået går foran et felt med samme navn i den innebygde structen.
	Klienter []KlientMedAltinn `json:"klienter,omitempty"`
}

// KlientMedAltinn er en klient fra Tenor med parten fra Register.
type KlientMedAltinn struct {
	Virksomhet
	Altinn *Party `json:"altinn"`
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
// tilretteleggere i stedet, valgfritt med klienter. Med --register får hver
// virksomhet, daglig leder og klient parten fra Register (reg). Med --format
// csv skrives de valgte kolonnene, én rad per klient med --klienter.
func runVirksomheter(ctx context.Context, c *TenorClient, reg *RegisterClient, ut, logg io.Writer, opts *virksomheterOptions) error {
	if opts.register && reg == nil {
		return fmt.Errorf("%w: --register krever en Register-klient", ErrInvalid)
	}
	format := opts.utskrift.effektivtFormat(opts.jsonOutput, opts.register)
	var kolonner []kolonne[virksomhetRad]
	if format == formatCSV {
		var err error
		if kolonner, err = velgKolonner(virksomhetKolonner, opts.utskrift.kolonner, opts.standardKolonner(), opts.register); err != nil {
			return err
		}
	}

	virksomheter, err := hentForValg(ctx, c, logg, opts)
	if err != nil {
		return err
	}
	if len(virksomheter) == 0 {
		return fmt.Errorf("%w: ingen treff", ErrNotFound)
	}
	if len(virksomheter) < opts.antall {
		fmt.Fprintf(logg, "Advarsel: fant bare %d av %d ønskede virksomheter.\n", len(virksomheter), opts.antall)
	}

	rader := make([]VirksomhetMedAltinn, len(virksomheter))
	for i, v := range virksomheter {
		rader[i] = VirksomhetMedAltinn{Virksomhet: v}
	}
	if opts.register {
		if err := berikVirksomheter(ctx, reg, rader, opts.env, logg); err != nil {
			return err
		}
	}

	switch format {
	case formatCSV:
		hoppetOver, err := skrivCSV(ut, csvRader(rader, opts.klienter > 0), kolonner)
		if hoppetOver > 0 {
			fmt.Fprintf(logg, "Hoppet over %d rader som mangler verdier (f.eks. ikke i Register).\n", hoppetOver)
		}
		if err != nil {
			return err
		}
	case formatJSON:
		var data any = virksomheter
		if opts.register {
			data = rader
		}
		if err := skrivJSON(ut, data); err != nil {
			return err
		}
	default:
		skrivVirksomheterTekst(ut, virksomheter)
	}
	fmt.Fprintf(logg, "-> %d virksomheter\n", len(virksomheter))
	return nil
}

// hentForValg henter virksomhetene etter flaggene: vanlige virksomheter fra
// kql, eller tilretteleggere med --rolle, med klienter med --klienter.
func hentForValg(ctx context.Context, c *TenorClient, logg io.Writer, opts *virksomheterOptions) ([]Virksomhet, error) {
	if opts.rolle == "" {
		kql := opts.kql
		if kql == "" {
			kql = standardVirksomhetKQL
		}
		fmt.Fprintf(logg, "Henter %d virksomheter fra Tenor med KQL: %s\n", opts.antall, kql)
		return hentVirksomheter(ctx, c, kql, opts.antall)
	}

	rolle, err := finnTilretteleggerRolle(opts.rolle)
	if err != nil {
		return nil, err
	}
	fmt.Fprintf(logg, "Henter %d %s-virksomheter fra Tenor via klientene (%s)\n", opts.antall, rolle.navn, Finnes(rolle.felt))
	virksomheter, err := hentTilretteleggere(ctx, c, rolle, opts.antall, opts.maksKlienter, logg)
	if err != nil {
		return nil, err
	}
	if opts.klienter > 0 {
		for i := range virksomheter {
			if virksomheter[i].Klienter, err = hentKlienter(ctx, c, rolle, virksomheter[i].Organisasjonsnummer, opts.klienter); err != nil {
				return nil, err
			}
		}
	}
	return virksomheter, nil
}

// berikVirksomheter slår opp virksomhetene, daglige ledere og klientene i
// Register i samme kall.
func berikVirksomheter(ctx context.Context, reg *RegisterClient, rader []VirksomhetMedAltinn, miljoe string, logg io.Writer) error {
	ider := make([]string, 0, 2*len(rader))
	for _, r := range rader {
		ider = append(ider, r.Organisasjonsnummer, r.DagligLeder)
		for _, k := range r.Virksomhet.Klienter {
			ider = append(ider, k.Organisasjonsnummer)
		}
	}
	parter, err := slaaOppIRegister(ctx, reg, ider, miljoe, logg)
	if err != nil {
		return err
	}
	finn := func(id string) *Party {
		if p, ok := parter[id]; ok {
			return &p
		}
		return nil
	}
	for i := range rader {
		r := &rader[i]
		r.AltinnEnvironment = miljoe
		r.Altinn = finn(r.Organisasjonsnummer)
		r.DagligLederAltinn = finn(r.DagligLeder)
		for _, k := range r.Virksomhet.Klienter {
			r.Klienter = append(r.Klienter, KlientMedAltinn{Virksomhet: k, Altinn: finn(k.Organisasjonsnummer)})
		}
	}
	return nil
}

// csvRader gjør om virksomhetene til CSV-rader. Med klienter blir det én rad
// per klient, og en tilrettelegger uten klienter gir ingen rad.
func csvRader(rader []VirksomhetMedAltinn, medKlienter bool) []virksomhetRad {
	ut := make([]virksomhetRad, 0, len(rader))
	for _, r := range rader {
		if !medKlienter {
			ut = append(ut, virksomhetRad{VirksomhetMedAltinn: r})
			continue
		}
		// Uten --register er klientene bare i Virksomhet.Klienter.
		klienter := r.Klienter
		if klienter == nil {
			for _, k := range r.Virksomhet.Klienter {
				klienter = append(klienter, KlientMedAltinn{Virksomhet: k})
			}
		}
		for i := range klienter {
			ut = append(ut, virksomhetRad{VirksomhetMedAltinn: r, Klient: &klienter[i]})
		}
	}
	return ut
}

// skrivVirksomheterTekst skriver orgnr, navn og daglig leder per linje, med
// rolle og antall klienter når de er kjent, og klientene innrykket under.
func skrivVirksomheterTekst(ut io.Writer, virksomheter []Virksomhet) {
	for _, v := range virksomheter {
		felt := []string{v.Organisasjonsnummer, v.Navn, v.DagligLeder}
		if v.Rolle != "" {
			felt = append(felt, v.Rolle)
		}
		if v.AntallKlienter > 0 {
			felt = append(felt, fmt.Sprintf("%d klienter", v.AntallKlienter))
		}
		fmt.Fprintln(ut, strings.Join(felt, "\t"))
		for _, k := range v.Klienter {
			fmt.Fprintf(ut, "  klient\t%s\t%s\n", k.Organisasjonsnummer, k.Navn)
		}
	}
}

func init() {
	tenorCmd.AddCommand(newVirksomheterCmd())
}
