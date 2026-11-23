package cmd

// The clients, set up from the configuration.

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

// defaultEnv is the environment when --env, or env in the API, is not given.
const defaultEnv = "at23"

// newTenorClient creates a Tenor client with a Maskinporten token, using
// MASKINPORTEN_CLIENT_ID and MASKINPORTEN_JWK from the configuration.
func newTenorClient() (*tenor.Client, error) {
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

// newRegisterClient creates a Register client for env with a platform token
// from the test token generator.
func newRegisterClient(env string) (*register.Client, error) {
	s, err := readRegisterSetup(env)
	if err != nil {
		return nil, err
	}
	pt, err := platformtoken.NewGenerator(s.token)
	if err != nil {
		return nil, err
	}
	return register.NewClient(s.baseURL, s.key, pt), nil
}

// registerSetup is what newRegisterClient reads from the configuration.
type registerSetup struct {
	baseURL string
	key     string
	token   platformtoken.Config
}

// readRegisterSetup reads API_BASE_URL and the subscription key from the
// section for env in the configuration. The subscription key can also be
// named <ENV>_REGISTER_SUBSCRIPTION_KEY, as in the frontend.
func readRegisterSetup(env string) (registerSetup, error) {
	if !slices.Contains(config.Environments, env) {
		return registerSetup{}, fmt.Errorf("%w: unknown environment %q, use one of %s", errs.Invalid, env, strings.Join(config.Environments, ", "))
	}
	get := config.For(env)
	if name := get("ENV_NAME"); name != "" && !strings.EqualFold(name, env) {
		return registerSetup{}, fmt.Errorf("%w: ENV_NAME is %q, but --env is %q", errs.Invalid, name, env)
	}
	s := registerSetup{
		baseURL: get("API_BASE_URL"),
		key:     cmp.Or(get(strings.ToUpper(env)+"_REGISTER_SUBSCRIPTION_KEY"), get("REGISTER_SUBSCRIPTION_KEY")),
	}
	if s.baseURL == "" {
		return registerSetup{}, config.WithHint(fmt.Errorf("%w: API_BASE_URL is missing for %s", errs.Invalid, env))
	}
	if s.key == "" {
		return registerSetup{}, config.WithHint(fmt.Errorf("%w: REGISTER_SUBSCRIPTION_KEY is missing for %s", errs.Invalid, env))
	}
	var err error
	if s.token, err = platformtoken.ConfigFrom(get, env); err != nil {
		return registerSetup{}, config.WithHint(err)
	}
	return s, nil
}
