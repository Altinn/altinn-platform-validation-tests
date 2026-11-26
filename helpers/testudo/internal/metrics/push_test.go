package metrics

import (
	"bytes"
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/prometheus/client_golang/prometheus"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// noBackoff makes Push try again at once.
func noBackoff(t *testing.T) {
	t.Helper()
	saved := backoff
	backoff = func(int) time.Duration { return 0 }
	t.Cleanup(func() { backoff = saved })
}

func testRegistry(t *testing.T) *prometheus.Registry {
	t.Helper()
	reg := prometheus.NewRegistry()
	g := prometheus.NewGaugeVec(prometheus.GaugeOpts{Name: "playwright_test_run_status", Help: "Status"}, []string{"deploy_env"})
	reg.MustRegister(g)
	g.WithLabelValues("at23").Set(1)
	return reg
}

// pushgateway answers with the statuses in turn, and then with 200. It counts
// the requests.
func pushgateway(t *testing.T, statuses ...int) (*httptest.Server, *int) {
	t.Helper()
	requests := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests++
		if r.Method != http.MethodPut {
			t.Errorf("method = %s, want PUT", r.Method)
		}
		if want := "/metrics/job/playwright_tests/environment/at23"; r.URL.Path != want {
			t.Errorf("path = %s, want %s", r.URL.Path, want)
		}
		if requests <= len(statuses) {
			w.WriteHeader(statuses[requests-1])
		}
	}))
	t.Cleanup(srv.Close)
	return srv, &requests
}

func TestPushReplacesTheGroup(t *testing.T) {
	var body []byte
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			t.Errorf("method = %s, want PUT", r.Method)
		}
		if want := "/metrics/job/playwright_tests/environment/at23"; r.URL.Path != want {
			t.Errorf("path = %s, want %s", r.URL.Path, want)
		}
		body, _ = io.ReadAll(r.Body)
	}))
	defer srv.Close()

	if err := Push(context.Background(), srv.URL, PlaywrightJob, "at23", testRegistry(t), io.Discard); err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains(body, []byte("playwright_test_run_status")) {
		t.Errorf("the metric is not in the request:\n%q", body)
	}
}

func TestPushTriesAgain(t *testing.T) {
	noBackoff(t)
	srv, requests := pushgateway(t, http.StatusServiceUnavailable, http.StatusBadGateway)
	var log bytes.Buffer

	if err := Push(context.Background(), srv.URL, PlaywrightJob, "at23", testRegistry(t), &log); err != nil {
		t.Fatal(err)
	}
	if *requests != 3 {
		t.Errorf("requests = %d, want 3", *requests)
	}
	if !strings.Contains(log.String(), "Could not push the metrics (attempt 2 of 6)") {
		t.Errorf("unexpected log:\n%s", log.String())
	}
}

func TestPushGivesUp(t *testing.T) {
	noBackoff(t)
	statuses := make([]int, 10)
	for i := range statuses {
		statuses[i] = http.StatusServiceUnavailable
	}
	srv, requests := pushgateway(t, statuses...)

	err := Push(context.Background(), srv.URL, PlaywrightJob, "at23", testRegistry(t), io.Discard)
	if !errors.Is(err, errs.Connection) {
		t.Errorf("got %v, want errs.Connection", err)
	}
	if *requests != pushAttempts {
		t.Errorf("requests = %d, want %d", *requests, pushAttempts)
	}
}

func TestPushStopsWhenCanceled(t *testing.T) {
	srv, requests := pushgateway(t, http.StatusServiceUnavailable, http.StatusServiceUnavailable)
	ctx, cancel := context.WithCancel(context.Background())
	saved := backoff
	backoff = func(int) time.Duration { cancel(); return time.Hour }
	t.Cleanup(func() { backoff = saved })

	err := Push(ctx, srv.URL, PlaywrightJob, "at23", testRegistry(t), io.Discard)
	if !errors.Is(err, errs.Connection) {
		t.Errorf("got %v, want errs.Connection", err)
	}
	if *requests != 1 {
		t.Errorf("requests = %d, want 1", *requests)
	}
}

func TestBackoff(t *testing.T) {
	var got []time.Duration
	for attempt := 1; attempt < pushAttempts; attempt++ {
		got = append(got, backoff(attempt))
	}
	want := []time.Duration{2 * time.Second, 4 * time.Second, 8 * time.Second, 16 * time.Second, 30 * time.Second}
	if len(got) != len(want) {
		t.Fatalf("got %v, want %v", got, want)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("got %v, want %v", got, want)
			break
		}
	}
}

func TestWrite(t *testing.T) {
	var out bytes.Buffer
	if err := Write(&out, testRegistry(t)); err != nil {
		t.Fatal(err)
	}
	want := "# HELP playwright_test_run_status Status\n" +
		"# TYPE playwright_test_run_status gauge\n" +
		"playwright_test_run_status{deploy_env=\"at23\"} 1\n"
	if out.String() != want {
		t.Errorf("got\n%s\nwant\n%s", out.String(), want)
	}
}
