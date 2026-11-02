package cmd

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/parties"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

type personerOptions struct {
	antall     int
	kql        string
	navn       bool
	jsonOutput bool
	env        string
	utskrift   utskriftValg
}

// standardPersonKolonner er CSV-kolonnene uten --columns.
var standardPersonKolonner = []string{"personIdentifier", "userId", "partyId", "partyUuid"}

// personKolonner er kolonnene en person kan skrives ut med i CSV. Navnene og
// verdiene er feltene i Register (Party).
var personKolonner = []kolonne[parties.Person]{
	{navn: "personIdentifier", verdi: func(p parties.Person) string { return p.PersonIdentifier }},
	{navn: "userId", verdi: func(p parties.Person) string { return brukerID(&p.Party) }},
	{navn: "partyId", verdi: func(p parties.Person) string { return partyID(&p.Party) }},
	{navn: "partyUuid", verdi: func(p parties.Person) string { return p.PartyUUID }},
	{navn: "displayName", verdi: func(p parties.Person) string { return p.DisplayName }},
	{navn: "lastName", verdi: func(p parties.Person) string { return p.LastName }},
	{navn: "firstName", verdi: func(p parties.Person) string { return p.FirstName }},
}

func newPersonsCmd() *cobra.Command {
	opts := &personerOptions{}

	cmd := &cobra.Command{
		Use:   "persons",
		Short: "Hent testpersoner fra Tenor",
		RunE: func(cmd *cobra.Command, args []string) error {
			if opts.antall < 1 {
				return fmt.Errorf("%w: --count må være minst 1", errs.Invalid)
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
		&opts.antall, "count", "n", 1,
		"Antall personer som hentes",
	)
	cmd.Flags().StringVar(
		&opts.kql, "kql", "",
		"Egendefinert KQL (default: bosatt + myndig)",
	)
	cmd.Flags().BoolVar(
		&opts.navn, "name", false,
		"Skriv ut navnet (displayName i Register) ved siden av fnr",
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

// runPersoner skriver personene til ut og meldinger til logg, som i
// TS-versjonen: fnr per linje, fnr og navn med --name, eller JSON med --json.
// Bare personer som finnes i Register (reg) blir med. Med --format csv skrives
// de valgte kolonnene.
func runPersoner(ctx context.Context, c *tenor.Client, reg *register.Client, ut, logg io.Writer, opts *personerOptions) error {
	if reg == nil {
		return fmt.Errorf("%w: mangler Register-klient", errs.Invalid)
	}
	format := opts.utskrift.effektivtFormat(opts.jsonOutput)
	var kolonner []kolonne[parties.Person]
	if format == formatCSV {
		var err error
		if kolonner, err = velgKolonner(personKolonner, opts.utskrift.kolonner, standardPersonKolonner); err != nil {
			return err
		}
	}

	kql := opts.kql
	if kql == "" {
		kql = parties.DefaultPersonKQL(time.Now())
	}
	fmt.Fprintf(logg, "Henter %d person(er) fra Tenor med KQL: %s\n", opts.antall, kql)

	personer, err := parties.FindPersons(ctx, c, reg, kql, opts.antall, opts.env, logg)
	if err != nil {
		return err
	}
	if len(personer) == 0 {
		return fmt.Errorf("%w: ingen treff som finnes i Register for %s", errs.NotFound, opts.env)
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
			fmt.Fprintf(ut, "%s\t%s\n", p.PersonIdentifier, p.DisplayName)
		} else {
			fmt.Fprintln(ut, p.PersonIdentifier)
		}
	}
	return nil
}
