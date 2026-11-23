package slack

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

func TestSendPostsText(t *testing.T) {
	var got map[string]string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.Header.Get("Content-Type") != "application/json" {
			t.Errorf("got %s with Content-Type %q", r.Method, r.Header.Get("Content-Type"))
		}
		if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
			t.Error(err)
		}
	}))
	defer srv.Close()

	if err := Send(t.Context(), srv.URL, "hei"); err != nil {
		t.Fatal(err)
	}
	if got["text"] != "hei" {
		t.Errorf("text = %q, want %q", got["text"], "hei")
	}
}

func TestSendErrorStatus(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "invalid_token", http.StatusForbidden)
	}))
	defer srv.Close()

	if err := Send(t.Context(), srv.URL, "hei"); !errors.Is(err, errs.InvalidResponse) {
		t.Errorf("got %v, want errs.InvalidResponse", err)
	}
}
