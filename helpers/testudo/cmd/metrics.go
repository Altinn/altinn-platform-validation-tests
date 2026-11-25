package cmd

import (
	"context"
	"sync"
	"time"

	"github.com/prometheus/client_golang/prometheus"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/selfservice"
)

// The self-service API is asked at most this often, however often Prometheus
// scrapes.
const keyExpiryCacheFor = 5 * time.Minute

var keyExpiryDesc = prometheus.NewDesc(
	"maskinporten_client_key_expiry_timestamp_seconds",
	"When the key on the Maskinporten client expires, in Unix seconds. Days left is (value - time()) / 86400. Keys without exp are left out.",
	[]string{"client_id", "client_name", "org", "used_by", "kid"}, nil,
)

// keyExpiryCollector is a Gauge with one series per key on keyClients. The
// series are made on each scrape, so a key that is removed from a client
// disappears from the metric too.
type keyExpiryCollector struct {
	newClient func() (*selfservice.Client, error)
	now       func() time.Time

	mu      sync.Mutex
	client  *selfservice.Client
	keys    []clientKey
	fetched time.Time
}

func (c *keyExpiryCollector) Describe(ch chan<- *prometheus.Desc) {
	ch <- keyExpiryDesc
}

// Collect gives the keys, or an error that fails the scrape so it shows up
// in Prometheus rather than as a metric that silently stops.
func (c *keyExpiryCollector) Collect(ch chan<- prometheus.Metric) {
	keys, err := c.read()
	if err != nil {
		ch <- prometheus.NewInvalidMetric(keyExpiryDesc, err)
		return
	}
	for _, k := range keys {
		if k.Expires.IsZero() {
			continue
		}
		ch <- prometheus.MustNewConstMetric(keyExpiryDesc, prometheus.GaugeValue, float64(k.Expires.Unix()),
			k.ClientID, k.ClientName, k.Org, k.UsedBy, k.Kid)
	}
}

// read gives the cached keys, and asks the self-service API when they are
// older than keyExpiryCacheFor. The client is made the first time, so serve
// starts also without the selfservice configuration.
func (c *keyExpiryCollector) read() ([]clientKey, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := c.now()
	if !c.fetched.IsZero() && now.Sub(c.fetched) < keyExpiryCacheFor {
		return c.keys, nil
	}
	if c.client == nil {
		client, err := c.newClient()
		if err != nil {
			return nil, err
		}
		c.client = client
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	keys, err := clientKeys(ctx, c.client, now)
	if err != nil {
		return nil, err
	}
	c.keys, c.fetched = keys, now
	return keys, nil
}
