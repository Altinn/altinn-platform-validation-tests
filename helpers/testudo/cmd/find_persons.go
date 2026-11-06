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

type personsOptions struct {
	count      int
	kql        string
	name       bool
	jsonOutput bool
	env        string
	output     outputOptions
}

// defaultPersonColumns are the CSV columns without --columns.
var defaultPersonColumns = []string{"personIdentifier", "userId", "partyId", "partyUuid"}

// personColumns are the columns a person can be printed with in CSV. The names
// and values are the fields in Register (Party).
var personColumns = []column[parties.Person]{
	{name: "personIdentifier", value: func(p parties.Person) string { return p.PersonIdentifier }},
	{name: "userId", value: func(p parties.Person) string { return userID(&p.Party) }},
	{name: "partyId", value: func(p parties.Person) string { return partyID(&p.Party) }},
	{name: "partyUuid", value: func(p parties.Person) string { return p.PartyUUID }},
	{name: "displayName", value: func(p parties.Person) string { return p.DisplayName }},
	{name: "lastName", value: func(p parties.Person) string { return p.LastName }},
	{name: "firstName", value: func(p parties.Person) string { return p.FirstName }},
}

func newPersonsCmd() *cobra.Command {
	opts := &personsOptions{}

	cmd := &cobra.Command{
		Use:   "persons",
		Short: "Fetch test persons from Tenor",
		RunE: func(cmd *cobra.Command, args []string) error {
			if opts.count < 1 {
				return fmt.Errorf("%w: --count must be at least 1", errs.Invalid)
			}
			if err := validateOutput(opts.output, opts.jsonOutput, personColumns, defaultPersonColumns); err != nil {
				return err
			}
			// Register is set up before Tenor, so configuration errors come
			// before we fetch anything.
			reg, err := newRegisterClient(opts.env)
			if err != nil {
				return err
			}
			c, err := newTenorClient()
			if err != nil {
				return err
			}
			log := cmd.ErrOrStderr()
			return withOutFile(opts.output.out, cmd.OutOrStdout(), log, func(out io.Writer) error {
				return runPersons(cmd.Context(), c, reg, out, log, opts)
			})
		},
	}

	cmd.Flags().IntVar(
		&opts.count, "count", 1,
		"Number of persons to fetch",
	)
	cmd.Flags().StringVar(
		&opts.kql, "kql", "",
		"Custom KQL (default: personstatus bosatt, 18 or older)",
	)
	cmd.Flags().BoolVar(
		&opts.name, "name", false,
		"Print the name (displayName in Register) next to the fødselsnummer",
	)
	cmd.Flags().BoolVar(
		&opts.jsonOutput, "json", false,
		"Print the full kildedata and the party from Register as JSON",
	)
	cmd.Flags().StringVar(
		&opts.env, "env", defaultEnv,
		"Environment: at22, at23, tt02 or yt01 (section in the config file)",
	)
	addOutputFlags(cmd, &opts.output, defaultPersonColumns)

	return cmd
}

// runPersons writes the persons to out and messages to log, as in the TS
// version: one fødselsnummer per line, fødselsnummer and name with --name, or
// JSON with --json. Only persons that exist in Register (reg) are included.
// With --format csv the selected columns are written.
func runPersons(ctx context.Context, c *tenor.Client, reg *register.Client, out, log io.Writer, opts *personsOptions) error {
	if reg == nil {
		return fmt.Errorf("%w: missing Register client", errs.Invalid)
	}
	format := opts.output.effectiveFormat(opts.jsonOutput)
	var columns []column[parties.Person]
	if format == formatCSV {
		var err error
		if columns, err = selectColumns(personColumns, opts.output.columns, defaultPersonColumns); err != nil {
			return err
		}
	}

	kql := opts.kql
	if kql == "" {
		kql = parties.DefaultPersonKQL(time.Now())
	}
	fmt.Fprintf(log, "Fetching %d person(s) from Tenor with KQL: %s\n", opts.count, kql)

	persons, err := parties.FindPersons(ctx, c, reg, kql, opts.count, opts.env, log)
	if err != nil {
		return err
	}
	if len(persons) == 0 {
		return fmt.Errorf("%w: no matches that exist in Register for %s", errs.NotFound, opts.env)
	}
	if len(persons) < opts.count {
		fmt.Fprintf(log, "Warning: found only %d of %d requested persons.\n", len(persons), opts.count)
	}

	switch format {
	case formatCSV:
		skipped, err := writeCSV(out, persons, columns)
		if skipped > 0 {
			fmt.Fprintf(log, "Skipped %d persons with missing values (e.g. without a user).\n", skipped)
		}
		return err
	case formatJSON:
		return writeJSON(out, persons)
	}
	for _, p := range persons {
		if opts.name {
			fmt.Fprintf(out, "%s\t%s\n", p.PersonIdentifier, p.DisplayName)
		} else {
			fmt.Fprintln(out, p.PersonIdentifier)
		}
	}
	return nil
}
