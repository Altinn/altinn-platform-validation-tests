package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	urlsFile   = "swagger-urls.txt"
	swaggerDir = ".swagger"
	stateFile  = ".swagger/state.json"
)

type State struct {
	LastModified string `json:"last_modified,omitempty"`
	Hash         string `json:"hash,omitempty"`
}

type States map[string]State

func main() {
	urls, err := readURLs(urlsFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error reading %s: %v\n", urlsFile, err)
		os.Exit(1)
	}

	if err := os.MkdirAll(swaggerDir, 0755); err != nil {
		fmt.Fprintf(os.Stderr, "error creating %s: %v\n", swaggerDir, err)
		os.Exit(1)
	}

	states, err := readState(stateFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error reading %s: %v\n", stateFile, err)
		os.Exit(1)
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	changed := false
	var errors []string

	for _, swaggerURL := range urls {
		fmt.Printf("Checking %s...\n", swaggerURL)

		state := states[swaggerURL]

		req, err := http.NewRequest(http.MethodGet, swaggerURL, nil)
		if err != nil {
			recordError(&errors, swaggerURL, err)
			continue
		}

		// Use Last-Modified as a cache hint only.
		// The actual content hash determines whether the document changed.
		if state.LastModified != "" {
			req.Header.Set("If-Modified-Since", state.LastModified)
		}

		resp, err := client.Do(req)
		if err != nil {
			recordError(&errors, swaggerURL, err)
			continue
		}

		body, readErr := io.ReadAll(resp.Body)
		resp.Body.Close()

		if readErr != nil {
			recordError(&errors, swaggerURL, fmt.Errorf("reading response: %w", readErr))
			continue
		}

		if resp.StatusCode == http.StatusNotModified {
			fmt.Println("  No change (304 Not Modified)")
			continue
		}

		if resp.StatusCode != http.StatusOK {
			recordError(
				&errors,
				swaggerURL,
				fmt.Errorf("HTTP %d", resp.StatusCode),
			)
			continue
		}

		// Normalize line endings before hashing and saving.
		//warning: in the working copy of 'helpers/detect-new-swagger-versions/.swagger/docs.altinn.studio-swagger-altinn-broker-v1.json', CRLF will be replaced by LF the next time Git touches it
		body = normalizeBody(body)

		hash := hashBody(body)
		lastModified := resp.Header.Get("Last-Modified")
		documentFile := swaggerFilename(swaggerURL)
		documentPath := filepath.Join(swaggerDir, documentFile)

		// First run: save the document and establish the baseline.
		if state.Hash == "" {
			fmt.Println("  Initial state")
			fmt.Printf("    SHA-256: %s\n", hash)

			if lastModified != "" {
				fmt.Printf("    Last-Modified: %s\n", lastModified)
			}

			if err := os.WriteFile(documentPath, body, 0644); err != nil {
				recordError(
					&errors,
					swaggerURL,
					fmt.Errorf("saving document: %w", err),
				)
				continue
			}

			fmt.Printf("    Saved: %s\n", documentPath)

			states[swaggerURL] = State{
				LastModified: lastModified,
				Hash:         hash,
			}

			continue
		}

		// The content hash is the source of truth.
		// Last-Modified may change without the document changing,
		// or remain unchanged even when the document content changes.
		if state.Hash == hash {
			fmt.Println("  No change")

			if state.LastModified != lastModified {
				fmt.Println("    Last-Modified changed, but content is unchanged")
			}

			states[swaggerURL] = State{
				LastModified: lastModified,
				Hash:         hash,
			}

			continue
		}

		// Actual Swagger document changed.
		fmt.Println("  CHANGED!")
		fmt.Printf("    Previous SHA-256: %s\n", state.Hash)
		fmt.Printf("    Current SHA-256:  %s\n", hash)

		if state.LastModified != "" && lastModified != "" {
			fmt.Printf("    Previous Last-Modified: %s\n", state.LastModified)
			fmt.Printf("    Current Last-Modified:  %s\n", lastModified)
		}

		if err := os.WriteFile(documentPath, body, 0644); err != nil {
			recordError(
				&errors,
				swaggerURL,
				fmt.Errorf("saving document: %w", err),
			)
			continue
		}

		fmt.Printf("    Saved: %s\n", documentPath)

		states[swaggerURL] = State{
			LastModified: lastModified,
			Hash:         hash,
		}

		changed = true
	}

	if err := writeState(stateFile, states); err != nil {
		fmt.Fprintf(os.Stderr, "error writing %s: %v\n", stateFile, err)
		os.Exit(1)
	}

	// Any URL failure should make the workflow fail, even if the
	// other URLs were successfully checked.
	if len(errors) > 0 {
		fmt.Printf("\n%d URL(s) failed:\n", len(errors))

		for _, err := range errors {
			fmt.Printf("  - %s\n", err)
		}

		os.Exit(1)
	}

	if changed {
		fmt.Println("\nOne or more Swagger documents changed.")
		os.Exit(2)
	}

	fmt.Println("\nNo Swagger documents changed.")
}

func readURLs(filename string) ([]string, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	var urls []string

	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)

		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		urls = append(urls, line)
	}

	return urls, nil
}

func readState(filename string) (States, error) {
	data, err := os.ReadFile(filename)

	if os.IsNotExist(err) {
		return make(States), nil
	}

	if err != nil {
		return nil, err
	}

	var states States

	if err := json.Unmarshal(data, &states); err != nil {
		return nil, err
	}

	return states, nil
}

func writeState(filename string, states States) error {
	data, err := json.MarshalIndent(states, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(filename, data, 0644)
}

func hashBody(body []byte) string {
	sum := sha256.Sum256(body)
	return hex.EncodeToString(sum[:])
}

func normalizeBody(body []byte) []byte {
	body = bytes.ReplaceAll(body, []byte("\r\n"), []byte("\n"))
	body = bytes.ReplaceAll(body, []byte("\r"), []byte("\n"))

	return body
}

func swaggerFilename(rawURL string) string {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return "unknown.json"
	}

	name := parsed.Host + parsed.Path

	if parsed.RawQuery != "" {
		name += "_" + parsed.RawQuery
	}

	// Make the URL safe as a filename.
	name = strings.ToLower(name)
	name = strings.ReplaceAll(name, "/", "-")
	name = strings.ReplaceAll(name, "\\", "-")
	name = strings.ReplaceAll(name, ":", "-")
	name = strings.ReplaceAll(name, "?", "-")
	name = strings.ReplaceAll(name, "&", "-")
	name = strings.ReplaceAll(name, "=", "-")

	// Remove repeated dashes.
	name = strings.Trim(name, "-")
	for strings.Contains(name, "--") {
		name = strings.ReplaceAll(name, "--", "-")
	}

	switch {
	case strings.HasSuffix(name, ".json"):
		return name
	case strings.HasSuffix(name, ".yaml"):
		return name
	case strings.HasSuffix(name, ".yml"):
		return name
	default:
		return name + ".json"
	}
}

func recordError(errors *[]string, swaggerURL string, err error) {
	fmt.Printf("  ERROR: %v\n", err)
	*errors = append(*errors, fmt.Sprintf("%s: %v", swaggerURL, err))
}
