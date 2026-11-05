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

type organizationsOptions struct {
	count      int
	jsonOutput bool
	env        string
	// unitTypes are the unit types (organisasjonsform), e.g. AS or ENK. Empty
	// means AS.
	unitTypes []string
	// subunits fetches underenheter of organizations with the unit types.
	subunits bool
	// minSubunits is the minimum number of underenheter the organizations, or
	// the hovedenheter with --subunits, must have. 0 means no requirement.
	minSubunits int
	// organizationNumbers are specific organizations to fetch.
	organizationNumbers []string
	// role is revisor, regnskapsfoerer or forretningsfoerer.
	role string
	// personRole is the role the person has in the organization, e.g.
	// styreleder. Empty means the leader.
	personRole string
	output     outputOptions
}

// defaultOrganizationColumns are the CSV columns without --columns.
var defaultOrganizationColumns = []string{"organizationIdentifier", "displayName", "partyId", "partyUuid"}

// organizationColumns are the columns an organization can be printed with in
// CSV. All values are from Register, except type, which is the tilrettelegger
// role, and personRole. The organization's own columns have the field names in
// Register (Party). ssn, userId, userPartyId, userPartyUuid and lastName are
// the person with personRole: the leader, or the role in --person-role. The
// hovedenhet columns are the hovedenhet of an underenhet (the role hovedenhet
// in Register, overordnetEnhet in Enhetsregisteret), and empty for other
// organizations.
var organizationColumns = []column[parties.Organization]{
	{name: "organizationIdentifier", value: func(o parties.Organization) string { return o.OrganizationIdentifier }},
	{name: "displayName", value: func(o parties.Organization) string { return o.DisplayName }},
	{name: "partyId", value: func(o parties.Organization) string { return partyID(&o.Party) }},
	{name: "partyUuid", value: func(o parties.Organization) string { return o.PartyUUID }},
	{name: "unitType", value: func(o parties.Organization) string { return o.UnitType }},
	{name: "type", value: func(o parties.Organization) string { return o.Role }},
	{name: "personRole", value: func(o parties.Organization) string { return o.PersonRole }},
	{name: "ssn", value: func(o parties.Organization) string { return o.Person.PersonIdentifier }},
	{name: "userId", value: func(o parties.Organization) string { return userID(&o.Person) }},
	{name: "userPartyId", value: func(o parties.Organization) string { return partyID(&o.Person) }},
	{name: "userPartyUuid", value: func(o parties.Organization) string { return o.Person.PartyUUID }},
	{name: "lastName", value: func(o parties.Organization) string { return o.Person.LastName }},
	{name: "hovedenhetOrganizationIdentifier", value: func(o parties.Organization) string { return hovedenhet(o).OrganizationIdentifier }},
	{name: "hovedenhetDisplayName", value: func(o parties.Organization) string { return hovedenhet(o).DisplayName }},
	{name: "hovedenhetPartyId", value: func(o parties.Organization) string { return partyID(o.Hovedenhet) }},
	{name: "hovedenhetPartyUuid", value: func(o parties.Organization) string { return hovedenhet(o).PartyUUID }},
	{name: "hovedenhetUnitType", value: func(o parties.Organization) string { return hovedenhet(o).UnitType }},
}

// hovedenhet is the hovedenhet of o, or an empty party when o is not an
// underenhet.
func hovedenhet(o parties.Organization) register.Party {
	if o.Hovedenhet == nil {
		return register.Party{}
	}
	return *o.Hovedenhet
}

// validate checks the flags before anything is fetched. countSet is whether
// --count was given.
func (o *organizationsOptions) validate(countSet bool) error {
	for _, t := range o.unitTypes {
		if _, err := parties.FindUnitType(t); err != nil {
			return fmt.Errorf("%w: unknown --unit-type %q, use one of %s", errs.Invalid, t, strings.Join(parties.UnitTypes, ", "))
		}
	}
	for _, n := range o.organizationNumbers {
		if !parties.ValidOrganizationNumber(n) {
			return fmt.Errorf("%w: --orgno %q is not an organization number (9 digits)", errs.Invalid, n)
		}
	}
	if o.role != "" {
		if _, err := parties.FindRole(o.role); err != nil {
			return fmt.Errorf("%w: unknown --role %q, use one of %s", errs.Invalid, o.role, parties.RoleNames())
		}
	}
	if o.personRole != "" {
		if _, err := parties.FindPersonRole(o.personRole); err != nil {
			return fmt.Errorf("%w: unknown --person-role %q, use one of %s", errs.Invalid, o.personRole, parties.PersonRoleNames())
		}
	}

	// --unit-type, --orgno and --role each select the organizations in their
	// own way.
	var selected []string
	for flag, set := range map[string]bool{"--unit-type": len(o.unitTypes) > 0, "--orgno": len(o.organizationNumbers) > 0, "--role": o.role != ""} {
		if set {
			selected = append(selected, flag)
		}
	}
	if len(selected) > 1 {
		slices.Sort(selected)
		return fmt.Errorf("%w: %s cannot be used together", errs.Invalid, strings.Join(selected, " and "))
	}
	// --subunits selects the unit type of the hovedenheter, so it only works
	// with --unit-type.
	if o.subunits && (len(o.organizationNumbers) > 0 || o.role != "") {
		return fmt.Errorf("%w: --subunits cannot be used with --orgno or --role", errs.Invalid)
	}
	if o.minSubunits < 0 {
		return fmt.Errorf("%w: --min-subunits cannot be negative", errs.Invalid)
	}
	if o.minSubunits > 0 && (len(o.organizationNumbers) > 0 || o.role != "") {
		return fmt.Errorf("%w: --min-subunits cannot be used with --orgno or --role", errs.Invalid)
	}

	if len(o.organizationNumbers) > 0 {
		if countSet {
			return fmt.Errorf("%w: --count cannot be used with --orgno, which fetches one of each", errs.Invalid)
		}
		return nil
	}
	if o.count < 1 {
		return fmt.Errorf("%w: --count must be at least 1", errs.Invalid)
	}
	return nil
}

// wantedCount is how many organizations to fetch: one per --orgno, otherwise
// --count.
func (o *organizationsOptions) wantedCount() int {
	if len(o.organizationNumbers) > 0 {
		return len(o.organizationNumbers)
	}
	return o.count
}

func newOrganizationsCmd() *cobra.Command {
	opts := &organizationsOptions{}

	cmd := &cobra.Command{
		Use:   "organizations",
		Short: "Fetch organizations from Tenor in bulk",
		Long: `Fetch organizations with a person from Tenor. The person is the leader: daglig
leder, innehaver for ENK, or styreleder for BRL and ESEK without a daglig leder.
With --person-role it is a person with that role in Enhetsregisteret, e.g.
styreleder or styremedlem.

Without flags, AS organizations are fetched. Choose other unit types with
--unit-type, specific organizations with --orgno, or tilretteleggere (revisor,
regnskapsfoerer or forretningsfoerer) with --role.

With --subunits, underenheter (BEDR and AAFY) of organizations with the unit
types in --unit-type are fetched instead of the organizations themselves, one
per hovedenhet. Underenheter have no persons of their own, so the person is
from the hovedenhet, and the hovedenhet columns describe the hovedenhet.

--min-subunits requires the organizations to have at least that many
underenheter, or with --subunits, the hovedenheter.`,
		Example: `  testudo find organizations -n 10
  testudo find organizations --unit-type enk,nuf -n 5 --format csv
  testudo find organizations --subunits -n 5 --format csv --columns organizationIdentifier,hovedenhetOrganizationIdentifier,ssn
  testudo find organizations --min-subunits 2 -n 5 --format csv
  testudo find organizations --person-role styremedlem -n 5 --format csv --columns organizationIdentifier,personRole,ssn
  testudo find organizations --orgno 313490114 --format csv
  testudo find organizations --role regnskapsfoerer -n 5 --format csv`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := opts.validate(cmd.Flags().Changed("count")); err != nil {
				return err
			}
			if err := validateOutput(opts.output, opts.jsonOutput, organizationColumns, defaultOrganizationColumns); err != nil {
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
				return runOrganizations(cmd.Context(), c, reg, out, log, opts)
			})
		},
	}

	cmd.Flags().IntVarP(
		&opts.count, "count", "n", 10,
		"Number of organizations to fetch",
	)
	cmd.Flags().StringSliceVar(
		&opts.unitTypes, "unit-type", nil,
		"Comma-separated unit types: "+strings.Join(parties.UnitTypes, ", ")+" (default: "+parties.DefaultUnitType+")",
	)
	cmd.Flags().IntVar(
		&opts.minSubunits, "min-subunits", 0,
		"Only organizations, or hovedenheter with --subunits, with at least this many underenheter",
	)
	cmd.Flags().BoolVar(
		&opts.subunits, "subunits", false,
		"Fetch underenheter (BEDR and AAFY) of organizations with the unit types in --unit-type",
	)
	cmd.Flags().StringSliceVar(
		&opts.organizationNumbers, "orgno", nil,
		"Comma-separated organization numbers to fetch",
	)
	cmd.Flags().StringVarP(
		&opts.role, "role", "r", "",
		"Fetch tilretteleggere: "+parties.RoleNames(),
	)
	cmd.Flags().StringVar(
		&opts.personRole, "person-role", "",
		"The person has this role in the organization (default: the leader): "+parties.PersonRoleNames(),
	)
	cmd.Flags().BoolVar(
		&opts.jsonOutput, "json", false,
		"Print as JSON, with the parties from Register",
	)
	cmd.Flags().StringVar(
		&opts.env, "env", "tt02",
		"Environment: tt02, at22, at23, yt01 (section in the config file)",
	)
	addOutputFlags(cmd, &opts.output, defaultOrganizationColumns)

	return cmd
}

// runOrganizations writes the organizations to out and messages to log:
// organization number, name and the person per line, or JSON with --json. Each
// organization and person gets the party from Register (reg). With --format
// csv the selected columns are written.
func runOrganizations(ctx context.Context, c *tenor.Client, reg *register.Client, out, log io.Writer, opts *organizationsOptions) error {
	if reg == nil {
		return fmt.Errorf("%w: missing Register client", errs.Invalid)
	}
	format := opts.output.effectiveFormat(opts.jsonOutput)
	var columns []column[parties.Organization]
	if format == formatCSV {
		var err error
		if columns, err = selectColumns(organizationColumns, opts.output.columns, defaultOrganizationColumns); err != nil {
			return err
		}
	}

	count := opts.wantedCount()
	q := parties.OrganizationQuery{
		Count:               count,
		UnitTypes:           opts.unitTypes,
		Subunits:            opts.subunits,
		MinSubunits:         opts.minSubunits,
		OrganizationNumbers: opts.organizationNumbers,
		Role:                opts.role,
		PersonRole:          opts.personRole,
		Env:                 opts.env,
	}
	person := "the leader"
	if opts.personRole != "" {
		person = opts.personRole
	}
	switch {
	case len(opts.organizationNumbers) > 0:
		fmt.Fprintf(log, "Fetching %d organizations with %s from Tenor: %s\n", count, person, strings.Join(opts.organizationNumbers, ", "))
	case opts.role != "":
		role, err := parties.FindRole(opts.role)
		if err != nil {
			return err
		}
		fmt.Fprintf(log, "Fetching %d %s organizations with %s from Tenor via the clients (%s)\n", count, role.Name, person, tenor.Exists(role.Field))
	case opts.subunits:
		fmt.Fprintf(log, "Fetching %d underenheter from Tenor, one per hovedenhet, with %s and KQL: %s\n", count, person, q.KQL())
	default:
		fmt.Fprintf(log, "Fetching %d organizations with %s from Tenor with KQL: %s\n", count, person, q.KQL())
	}

	organizations, err := parties.FindOrganizations(ctx, c, reg, q, log)
	if err != nil {
		return err
	}
	if len(organizations) == 0 {
		return fmt.Errorf("%w: no matches that exist in Register for %s", errs.NotFound, opts.env)
	}
	if len(organizations) < count {
		fmt.Fprintf(log, "Warning: found only %d of %d requested organizations.\n", len(organizations), count)
	}

	switch format {
	case formatCSV:
		skipped, err := writeCSV(out, organizations, columns)
		if skipped > 0 {
			fmt.Fprintf(log, "Skipped %d rows with missing values (e.g. a person without a user, or hovedenhet columns for an organization that is not an underenhet).\n", skipped)
		}
		if err != nil {
			return err
		}
	case formatJSON:
		if err := writeJSON(out, organizations); err != nil {
			return err
		}
	default:
		writeOrganizationsText(out, organizations)
	}
	fmt.Fprintf(log, "-> %d organizations\n", len(organizations))
	return nil
}

// writeOrganizationsText writes the organization number, name and the person
// per line, with the tilrettelegger role and the hovedenhet when they are set.
func writeOrganizationsText(out io.Writer, organizations []parties.Organization) {
	for _, o := range organizations {
		fields := []string{o.OrganizationIdentifier, o.DisplayName, o.Person.PersonIdentifier}
		if o.Role != "" {
			fields = append(fields, o.Role)
		}
		if o.Hovedenhet != nil {
			fields = append(fields, o.Hovedenhet.OrganizationIdentifier)
		}
		fmt.Fprintln(out, strings.Join(fields, "\t"))
	}
}
