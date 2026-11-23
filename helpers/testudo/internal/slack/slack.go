// Package slack sends messages to a Slack incoming webhook.
package slack

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

var httpClient = &http.Client{Timeout: 30 * time.Second}

// Send posts text to the webhook at webhookURL.
func Send(ctx context.Context, webhookURL, text string) error {
	payload, err := json.Marshal(map[string]string{"text": text})
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, webhookURL, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("%w: Slack webhook: %v", errs.Invalid, err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("%w: Slack: %v", errs.Connection, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("%w: Slack responded with %s", errs.InvalidResponse, resp.Status)
	}
	return nil
}
