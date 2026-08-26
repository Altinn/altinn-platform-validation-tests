package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"sigs.k8s.io/controller-runtime/pkg/metrics"
)

var (
	TestRunDeletionsTotal = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "cleaneroperator_testrun_deletions_total",
			Help: "Total number of TestRun resources deleted by the cleaner operator.",
		},
	)
)

func init() {
	metrics.Registry.MustRegister(
		TestRunDeletionsTotal,
	)
}
