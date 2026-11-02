package cmd

// Klientene, satt opp fra konfigurasjonen.

import (
	"cmp"
	"fmt"
	"slices"
	"strings"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/config"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/maskinporten"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/platformtoken"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

// nyTenorKlient lager en Tenor-klient med Maskinporten-token, med
// MASKINPORTEN_CLIENT_ID og MASKINPORTEN_JWK fra konfigurasjonen.
func nyTenorKlient() (*tenor.Client, error) {
	cfg, err := maskinporten.ConfigFrom(config.For(""))
	if err != nil {
		return nil, config.WithHint(err)
	}
	mp, err := maskinporten.NewClient(cfg, tenor.Scope)
	if err != nil {
		return nil, err
	}
	return tenor.NewClient(tenor.DefaultBaseURL, mp), nil
}

// nyRegisterKlient lager en Register-klient for miljoe med platform-token fra
// test token generator.
func nyRegisterKlient(miljoe string) (*register.Client, error) {
	o, err := lesRegisterOppsett(miljoe)
	if err != nil {
		return nil, err
	}
	pt, err := platformtoken.NewGenerator(o.token)
	if err != nil {
		return nil, err
	}
	return register.NewClient(o.baseURL, o.noekkel, pt), nil
}

// registerOppsett er det nyRegisterKlient leser fra konfigurasjonen.
type registerOppsett struct {
	baseURL string
	noekkel string
	token   platformtoken.Config
}

// lesRegisterOppsett leser API_BASE_URL og subscription key fra seksjonen for
// miljoe i konfigurasjonen. Subscription key kan også hete
// <MILJOE>_REGISTER_SUBSCRIPTION_KEY, som i frontend.
func lesRegisterOppsett(miljoe string) (registerOppsett, error) {
	if !slices.Contains(config.Environments, miljoe) {
		return registerOppsett{}, fmt.Errorf("%w: ukjent miljø %q, bruk en av %s", errs.Invalid, miljoe, strings.Join(config.Environments, ", "))
	}
	hent := config.For(miljoe)
	if navn := hent("ENV_NAME"); navn != "" && !strings.EqualFold(navn, miljoe) {
		return registerOppsett{}, fmt.Errorf("%w: ENV_NAME er %q, men --env er %q", errs.Invalid, navn, miljoe)
	}
	o := registerOppsett{
		baseURL: hent("API_BASE_URL"),
		noekkel: cmp.Or(hent(strings.ToUpper(miljoe)+"_REGISTER_SUBSCRIPTION_KEY"), hent("REGISTER_SUBSCRIPTION_KEY")),
	}
	if o.baseURL == "" {
		return registerOppsett{}, config.WithHint(fmt.Errorf("%w: API_BASE_URL mangler for %s", errs.Invalid, miljoe))
	}
	if o.noekkel == "" {
		return registerOppsett{}, config.WithHint(fmt.Errorf("%w: REGISTER_SUBSCRIPTION_KEY mangler for %s", errs.Invalid, miljoe))
	}
	var err error
	if o.token, err = platformtoken.ConfigFrom(hent, miljoe); err != nil {
		return registerOppsett{}, config.WithHint(err)
	}
	return o, nil
}
