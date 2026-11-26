package metrics

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/push"
	"github.com/prometheus/common/expfmt"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// PlaywrightJob is the Pushgateway job for Playwright runs.
const PlaywrightJob = "playwright_tests"

// pushAttempts is how many times Push tries before it gives up.
const pushAttempts = 6

var httpClient = &http.Client{Timeout: 30 * time.Second}

// backoff is how long Push waits after the failed attempt with this number,
// counted from 1: 2s, 4s, 8s, 16s and then 30s.
var backoff = func(attempt int) time.Duration {
	return min(2*time.Second<<(attempt-1), 30*time.Second)
}

// Push pushes the metrics in g to the Pushgateway at url, under job and the
// grouping key environment=env. What the Pushgateway has for the same job and
// environment is replaced. A failed push is tried again, up to six times in
// about a minute, since the Pushgateway can be restarting.
func Push(ctx context.Context, url, job, env string, g prometheus.Gatherer, log io.Writer) error {
	// TODO: Remove deploy_env from the metric labels and use the grouping key as
	// the environment label. That needs honor_labels in the Prometheus scrape
	// configuration.
	pusher := push.New(url, job).Grouping("environment", env).Gatherer(g).Client(httpClient)

	var err error
	for attempt := 1; ; attempt++ {
		if err = pusher.PushContext(ctx); err == nil {
			return nil
		}
		if attempt == pushAttempts || ctx.Err() != nil {
			break
		}
		wait := backoff(attempt)
		fmt.Fprintf(log, "Could not push the metrics (attempt %d of %d): %v. Trying again in %s.\n", attempt, pushAttempts, err, wait)
		select {
		case <-ctx.Done():
			return fmt.Errorf("%w: Pushgateway: %v", errs.Connection, ctx.Err())
		case <-time.After(wait):
		}
	}
	return fmt.Errorf("%w: Pushgateway: %v", errs.Connection, err)
}

// Write writes the metrics in g in the Prometheus text format, as they would
// be pushed.
func Write(w io.Writer, g prometheus.Gatherer) error {
	families, err := g.Gather()
	if err != nil {
		return err
	}
	enc := expfmt.NewEncoder(w, expfmt.NewFormat(expfmt.TypeTextPlain))
	for _, f := range families {
		if err := enc.Encode(f); err != nil {
			return err
		}
	}
	return nil
}
