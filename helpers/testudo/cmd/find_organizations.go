package cmd

import (
	"context"
	"fmt"
	"io"
	"slices"
	"strings"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/parties"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

type virksomheterOptions struct {
	antall     int
	jsonOutput bool
	env        string
	// organisasjonsformer er organisasjonsformene, f.eks. AS eller ENK. Tom
	// betyr aksjeselskaper.
	organisasjonsformer []string
	// orgnr er bestemte virksomheter som hentes.
	orgnr []string
	// rolle er revisor, regnskapsfoerer eller forretningsfoerer.
	rolle    string
	utskrift utskriftValg
}

// standardVirksomhetKolonner er CSV-kolonnene uten --columns.
var standardVirksomhetKolonner = []string{"organizationIdentifier", "displayName", "partyId", "partyUuid"}

// virksomhetKolonner er kolonnene en virksomhet kan skrives ut med i CSV. Alle
// verdiene er fra Register, utenom type, som er rollen. Virksomhetens egne
// kolonner har feltnavnene i Register (Party). ssn, userId, userPartyId,
// userPartyUuid og lastName er lederen: daglig leder, innehaver eller
// styreleder.
var virksomhetKolonner = []kolonne[parties.Organization]{
	{navn: "organizationIdentifier", verdi: func(v parties.Organization) string { return v.OrganizationIdentifier }},
	{navn: "displayName", verdi: func(v parties.Organization) string { return v.DisplayName }},
	{navn: "partyId", verdi: func(v parties.Organization) string { return partyID(&v.Party) }},
	{navn: "partyUuid", verdi: func(v parties.Organization) string { return v.PartyUUID }},
	{navn: "unitType", verdi: func(v parties.Organization) string { return v.UnitType }},
	{navn: "type", verdi: func(v parties.Organization) string { return v.Rolle }},
	{navn: "ssn", verdi: func(v parties.Organization) string { return v.LederParty.PersonIdentifier }},
	{navn: "userId", verdi: func(v parties.Organization) string { return brukerID(&v.LederParty) }},
	{navn: "userPartyId", verdi: func(v parties.Organization) string { return partyID(&v.LederParty) }},
	{navn: "userPartyUuid", verdi: func(v parties.Organization) string { return v.LederParty.PartyUUID }},
	{navn: "lastName", verdi: func(v parties.Organization) string { return v.LederParty.LastName }},
}

// valider sjekker flaggene før noe hentes. antallSatt er om --count ble
// oppgitt.
func (o *virksomheterOptions) valider(antallSatt bool) error {
	for _, f := range o.organisasjonsformer {
		if _, err := parties.FindUnitType(f); err != nil {
			return fmt.Errorf("%w: ukjent --unit-type %q, bruk en av %s", errs.Invalid, f, strings.Join(parties.UnitTypes, ", "))
		}
	}
	for _, orgnr := range o.orgnr {
		if !parties.ValidOrganizationNumber(orgnr) {
			return fmt.Errorf("%w: --orgno %q er ikke et organisasjonsnummer (9 siffer)", errs.Invalid, orgnr)
		}
	}
	if o.rolle != "" {
		if _, err := parties.FindRole(o.rolle); err != nil {
			return fmt.Errorf("%w: ukjent --role %q, bruk en av %s", errs.Invalid, o.rolle, parties.RoleNames())
		}
	}

	// --unit-type, --orgno og --role velger virksomhetene på hver sin måte.
	var valgt []string
	for flagg, satt := range map[string]bool{"--unit-type": len(o.organisasjonsformer) > 0, "--orgno": len(o.orgnr) > 0, "--role": o.rolle != ""} {
		if satt {
			valgt = append(valgt, flagg)
		}
	}
	if len(valgt) > 1 {
		slices.Sort(valgt)
		return fmt.Errorf("%w: %s kan ikke brukes sammen", errs.Invalid, strings.Join(valgt, " og "))
	}

	if len(o.orgnr) > 0 {
		if antallSatt {
			return fmt.Errorf("%w: --count kan ikke brukes med --orgno, som henter én av hver", errs.Invalid)
		}
		return nil
	}
	if o.antall < 1 {
		return fmt.Errorf("%w: --count må være minst 1", errs.Invalid)
	}
	return nil
}

// onsketAntall er hvor mange virksomheter som skal hentes: én per --orgno,
// ellers --count.
func (o *virksomheterOptions) onsketAntall() int {
	if len(o.orgnr) > 0 {
		return len(o.orgnr)
	}
	return o.antall
}

func newOrganizationsCmd() *cobra.Command {
	opts := &virksomheterOptions{}

	cmd := &cobra.Command{
		Use:   "organizations",
		Short: "Hent virksomheter fra Tenor i bulk",
		Long: `Hent virksomheter med leder fra Tenor. Lederen er daglig leder, innehaver
for enkeltpersonforetak, eller styreleder for borettslag og eierseksjonssameier
uten daglig leder.

Uten flagg hentes aksjeselskaper. Velg andre organisasjonsformer med
--unit-type, bestemte virksomheter med --orgno, eller revisorer,
regnskapsførere og forretningsførere med --role.`,
		Example: `  testudo find organizations -n 10
  testudo find organizations --unit-type enk,nuf -n 5 --format csv
  testudo find organizations --orgno 313490114 --format csv
  testudo find organizations --role regnskapsfoerer -n 5 --format csv`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := opts.valider(cmd.Flags().Changed("count")); err != nil {
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
		&opts.antall, "count", "n", 10,
		"Antall virksomheter som hentes",
	)
	cmd.Flags().StringSliceVar(
		&opts.organisasjonsformer, "unit-type", nil,
		"Kommaseparerte organisasjonsformer: "+strings.Join(parties.UnitTypes, ", ")+" (standard: "+parties.DefaultUnitType+")",
	)
	cmd.Flags().StringSliceVar(
		&opts.orgnr, "orgno", nil,
		"Kommaseparerte organisasjonsnumre som hentes",
	)
	cmd.Flags().StringVarP(
		&opts.rolle, "role", "r", "",
		"Hent tilretteleggere: "+parties.RoleNames(),
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

// runVirksomheter skriver virksomhetene til ut og meldinger til logg: orgnr,
// navn og leder per linje, eller JSON med --json. Hver virksomhet og leder får
// parten fra Register (reg). Med --format csv skrives de valgte kolonnene.
func runVirksomheter(ctx context.Context, c *tenor.Client, reg *register.Client, ut, logg io.Writer, opts *virksomheterOptions) error {
	if reg == nil {
		return fmt.Errorf("%w: mangler Register-klient", errs.Invalid)
	}
	format := opts.utskrift.effektivtFormat(opts.jsonOutput)
	var kolonner []kolonne[parties.Organization]
	if format == formatCSV {
		var err error
		if kolonner, err = velgKolonner(virksomhetKolonner, opts.utskrift.kolonner, standardVirksomhetKolonner); err != nil {
			return err
		}
	}

	antall := opts.onsketAntall()
	switch {
	case len(opts.orgnr) > 0:
		fmt.Fprintf(logg, "Henter %d virksomheter fra Tenor: %s\n", antall, strings.Join(opts.orgnr, ", "))
	case opts.rolle != "":
		rolle, err := parties.FindRole(opts.rolle)
		if err != nil {
			return err
		}
		fmt.Fprintf(logg, "Henter %d %s-virksomheter fra Tenor via klientene (%s)\n", antall, rolle.Name, tenor.Exists(rolle.Field))
	default:
		fmt.Fprintf(logg, "Henter %d virksomheter fra Tenor med KQL: %s\n", antall, parties.OrganizationKQL(opts.organisasjonsformer))
	}

	virksomheter, err := parties.FindOrganizations(ctx, c, reg, parties.OrganizationQuery{
		Count:               antall,
		UnitTypes:           opts.organisasjonsformer,
		OrganizationNumbers: opts.orgnr,
		Role:                opts.rolle,
		Env:                 opts.env,
	}, logg)
	if err != nil {
		return err
	}
	if len(virksomheter) == 0 {
		return fmt.Errorf("%w: ingen treff som finnes i Register for %s", errs.NotFound, opts.env)
	}
	if len(virksomheter) < antall {
		fmt.Fprintf(logg, "Advarsel: fant bare %d av %d ønskede virksomheter.\n", len(virksomheter), antall)
	}

	switch format {
	case formatCSV:
		hoppetOver, err := skrivCSV(ut, virksomheter, kolonner)
		if hoppetOver > 0 {
			fmt.Fprintf(logg, "Hoppet over %d rader som mangler verdier (f.eks. leder uten bruker).\n", hoppetOver)
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

// skrivVirksomheterTekst skriver orgnr, navn og leder per linje, med rolle når
// den er satt.
func skrivVirksomheterTekst(ut io.Writer, virksomheter []parties.Organization) {
	for _, v := range virksomheter {
		felt := []string{v.OrganizationIdentifier, v.DisplayName, v.LederParty.PersonIdentifier}
		if v.Rolle != "" {
			felt = append(felt, v.Rolle)
		}
		fmt.Fprintln(ut, strings.Join(felt, "\t"))
	}
}
