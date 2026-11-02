package cmd

import (
	"cmp"
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/parties"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
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

// standardVirksomhetKolonner er CSV-kolonnene uten --columns.
var standardVirksomhetKolonner = []string{"organizationIdentifier", "displayName", "partyId", "partyUuid"}

// virksomhetKolonner er kolonnene en virksomhet kan skrives ut med i CSV. Alle
// verdiene er fra Register, utenom type, som er rollen. Virksomhetens egne
// kolonner har feltnavnene i Register (Party). ssn, userId, userPartyId,
// userPartyUuid og lastName er daglig leder.
var virksomhetKolonner = []kolonne[parties.Organization]{
	{navn: "organizationIdentifier", verdi: func(v parties.Organization) string { return v.OrganizationIdentifier }},
	{navn: "displayName", verdi: func(v parties.Organization) string { return v.DisplayName }},
	{navn: "partyId", verdi: func(v parties.Organization) string { return partyID(&v.Party) }},
	{navn: "partyUuid", verdi: func(v parties.Organization) string { return v.PartyUUID }},
	{navn: "unitType", verdi: func(v parties.Organization) string { return v.UnitType }},
	{navn: "type", verdi: func(v parties.Organization) string { return v.Rolle }},
	{navn: "ssn", verdi: func(v parties.Organization) string { return v.DagligLederParty.PersonIdentifier }},
	{navn: "userId", verdi: func(v parties.Organization) string { return brukerID(&v.DagligLederParty) }},
	{navn: "userPartyId", verdi: func(v parties.Organization) string { return partyID(&v.DagligLederParty) }},
	{navn: "userPartyUuid", verdi: func(v parties.Organization) string { return v.DagligLederParty.PartyUUID }},
	{navn: "lastName", verdi: func(v parties.Organization) string { return v.DagligLederParty.LastName }},
}

// valider sjekker flaggene før noe hentes. kqlSatt er om --kql ble oppgitt.
func (o *virksomheterOptions) valider(kqlSatt bool) error {
	if o.antall < 1 {
		return fmt.Errorf("%w: --count må være minst 1", errs.Invalid)
	}
	if o.rolle == "" {
		return nil
	}
	if _, err := parties.FindRole(o.rolle); err != nil {
		return fmt.Errorf("%w: ukjent --role %q, bruk en av %s", errs.Invalid, o.rolle, parties.RoleNames())
	}
	if kqlSatt {
		return fmt.Errorf("%w: --kql og --role kan ikke brukes sammen", errs.Invalid)
	}
	return nil
}

func newOrganizationsCmd() *cobra.Command {
	opts := &virksomheterOptions{}

	cmd := &cobra.Command{
		Use:   "organizations",
		Short: "Hent virksomheter fra Tenor i bulk",
		Long: `Hent virksomheter med daglig leder eller innehaver fra Tenor.

Uten --role hentes aksjeselskaper. Med --role hentes revisorer,
regnskapsførere eller forretningsførere.`,
		Example: `  testudo find organizations -n 10
  testudo find organizations --role regnskapsfoerer -n 5 --format csv`,
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
		&opts.antall, "count", "n", 10,
		"Antall virksomheter som hentes",
	)
	cmd.Flags().StringVarP(
		&opts.rolle, "role", "r", "",
		"Hent tilretteleggere: "+parties.RoleNames(),
	)
	cmd.Flags().StringVar(
		&opts.kql, "kql", parties.DefaultOrganizationKQL,
		"Egendefinert KQL, for de som kjenner Tenor (kan ikke brukes med --role)",
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
// navn og daglig leder per linje, eller JSON med --json. Med --role hentes
// tilretteleggere i stedet. Hver virksomhet og daglig leder får parten fra
// Register (reg). Med --format csv skrives de valgte kolonnene.
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

	if opts.rolle == "" {
		kql := cmp.Or(opts.kql, parties.DefaultOrganizationKQL)
		fmt.Fprintf(logg, "Henter %d virksomheter fra Tenor med KQL: %s\n", opts.antall, kql)
	} else {
		rolle, err := parties.FindRole(opts.rolle)
		if err != nil {
			return err
		}
		fmt.Fprintf(logg, "Henter %d %s-virksomheter fra Tenor via klientene (%s)\n", opts.antall, rolle.Name, tenor.Exists(rolle.Field))
	}

	virksomheter, err := parties.FindOrganizations(ctx, c, reg, parties.OrganizationQuery{
		Count: opts.antall,
		KQL:   opts.kql,
		Role:  opts.rolle,
		Env:   opts.env,
	}, logg)
	if err != nil {
		return err
	}
	if len(virksomheter) == 0 {
		return fmt.Errorf("%w: ingen treff som finnes i Register for %s", errs.NotFound, opts.env)
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

// skrivVirksomheterTekst skriver orgnr, navn og daglig leder per linje, med
// rolle når den er satt.
func skrivVirksomheterTekst(ut io.Writer, virksomheter []parties.Organization) {
	for _, v := range virksomheter {
		felt := []string{v.OrganizationIdentifier, v.DisplayName, v.DagligLederParty.PersonIdentifier}
		if v.Rolle != "" {
			felt = append(felt, v.Rolle)
		}
		fmt.Fprintln(ut, strings.Join(felt, "\t"))
	}
}
