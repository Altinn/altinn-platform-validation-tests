package cmd

import (
	"context"
	"fmt"
	"io"
	"math"
	"slices"
	"strconv"
	"text/tabwriter"
	"time"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/selfservice"
)

// keyClients are the Maskinporten clients whose keys we keep track of. The
// master client only sees Digdir's (991825827) clients, so the clients for
// 310149942 (Playwright MASKINPORTEN_BEHALF_OF_JWK) and 313175650 (K6) are
// not here.
var keyClients = []struct {
	id     string
	usedBy string
}{
	{"89e4066f-3d32-4a47-9259-4752f9041a35", "Playwright MASKINPORTEN_JWK, testudo Tenor"},
	{"5686d7c8-6847-4b71-bac8-7671845a1862", "testudo selfservice (the master client)"},
}

// clientKey is one key on one client, as printed by testudo maskinporten keys.
type clientKey struct {
	ClientID string    `json:"clientId"`
	Org      string    `json:"org"`
	UsedBy   string    `json:"usedBy"`
	Kid      string    `json:"kid"`
	Expires  time.Time `json:"expires,omitzero"`
	// DaysLeft is whole days until Expires, negative when it has expired, and
	// nil when the key has no exp.
	DaysLeft *int `json:"daysLeft"`
}

type keysOptions struct {
	jsonOutput bool
}

func newMaskinportenCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "maskinporten",
		Short: "Look at the Maskinporten clients the tests use",
	}
	cmd.AddCommand(newKeysCmd())
	return cmd
}

func newKeysCmd() *cobra.Command {
	opts := &keysOptions{}

	cmd := &cobra.Command{
		Use:   "keys",
		Short: "List the keys on our Maskinporten clients and when they expire",
		Long: `Lists the keys on the Maskinporten clients the tests use, with when each key
expires and how many days are left. The clients are read from Digdir's
self-service API with the master client in the selfservice section of the
configuration.`,
		Example: `  testudo maskinporten keys
  testudo maskinporten keys --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			c, err := newSelfServiceClient()
			if err != nil {
				return err
			}
			keys, err := clientKeys(cmd.Context(), c, time.Now())
			if err != nil {
				return err
			}
			if opts.jsonOutput {
				return writeJSON(cmd.OutOrStdout(), keys)
			}
			return writeKeysText(cmd.OutOrStdout(), keys)
		},
	}

	cmd.Flags().BoolVar(&opts.jsonOutput, "json", false, "Print JSON")
	return cmd
}

// clientKeys reads the keys on keyClients, sorted per client with the key
// that expires first at the top.
func clientKeys(ctx context.Context, c *selfservice.Client, now time.Time) ([]clientKey, error) {
	var result []clientKey
	for _, kc := range keyClients {
		client, err := c.GetClient(ctx, kc.id)
		if err != nil {
			return nil, fmt.Errorf("%s (%s): %w", kc.id, kc.usedBy, err)
		}
		jwks, err := c.GetJWKS(ctx, kc.id)
		if err != nil {
			return nil, fmt.Errorf("%s (%s): %w", kc.id, kc.usedBy, err)
		}
		var keys []clientKey
		for _, k := range jwks {
			key := clientKey{
				ClientID: client.ClientID,
				Org:      client.ClientOrgno,
				UsedBy:   kc.usedBy,
				Kid:      k.Kid,
				Expires:  k.Expires(),
			}
			if !key.Expires.IsZero() {
				days := int(math.Floor(key.Expires.Sub(now).Hours() / 24))
				key.DaysLeft = &days
			}
			keys = append(keys, key)
		}
		slices.SortStableFunc(keys, func(a, b clientKey) int {
			switch {
			case a.Expires.IsZero() != b.Expires.IsZero():
				if a.Expires.IsZero() {
					return 1
				}
				return -1
			default:
				return a.Expires.Compare(b.Expires)
			}
		})
		result = append(result, keys...)
	}
	return result, nil
}

func writeKeysText(out io.Writer, keys []clientKey) error {
	w := tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
	fmt.Fprintln(w, "CLIENT ID\tORG\tUSED BY\tKID\tEXPIRES\tDAYS LEFT")
	for _, k := range keys {
		expires, days := "no exp", "-"
		if k.DaysLeft != nil {
			expires, days = k.Expires.Format(time.DateOnly), strconv.Itoa(*k.DaysLeft)
		}
		fmt.Fprintf(w, "%s\t%s\t%s\t%s\t%s\t%s\n", k.ClientID, k.Org, k.UsedBy, k.Kid, expires, days)
	}
	return w.Flush()
}
