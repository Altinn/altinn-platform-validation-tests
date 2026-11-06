package cmd

// testudo serve: the find commands as an HTTP API. Each command is an
// endpoint, and its flags are query parameters with the same names. The two
// handlers are written out in full rather than sharing a generic one, so each
// can be read on its own next to the command it mirrors.

import (
	"bytes"
	"cmp"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"slices"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/spf13/cobra"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"
	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/tenor"
)

func newServeCmd() *cobra.Command {
	var addr string

	cmd := &cobra.Command{
		Use:   "serve",
		Short: "Serve the find commands as an HTTP API",
		Long: `Serve the find commands as an HTTP API:

  GET /find/persons          same as testudo find persons
  GET /find/organizations    same as testudo find organizations

The query parameters are the flags of the command, with the same names and
values, e.g. ?env=at23&count=5&unit-type=ENK. Lists can be comma-separated or
repeated, and a boolean without a value is true (?subunits). --out is not
available.

The response is CSV unless format=json (or json) or format=text is given.
Errors are JSON with an "error" field: 400 for invalid parameters, 404 when
nothing was found, and 502 when Tenor or Register fails.`,
		Example: `  testudo serve
  testudo serve --addr :8080
  curl "localhost:8080/find/persons?env=at23&count=3"
  curl "localhost:8080/find/organizations?env=at23&count=5&unit-type=ENK&columns=organizationIdentifier,ssn"`,
		RunE: func(cmd *cobra.Command, args []string) error {
			// Tenor is set up once, so a missing Maskinporten key stops the
			// server at start rather than failing every request.
			c, err := newTenorClient()
			if err != nil {
				return err
			}
			s := &server{
				tenor:     c,
				registers: map[string]*register.Client{},
				log:       cmd.ErrOrStderr(),
			}
			return s.listen(cmd.Context(), addr)
		},
	}

	cmd.Flags().StringVar(
		&addr, "addr", "localhost:8080",
		"Address to listen on, e.g. :8080 for all network interfaces",
	)

	return cmd
}

// server answers the API requests. The clients keep their tokens, so they are
// made once: Tenor at start, and Register the first time an environment is
// asked for.
type server struct {
	tenor *tenor.Client
	log   io.Writer

	mu        sync.Mutex
	registers map[string]*register.Client
}

// handler routes the endpoints to their handlers.
func (s *server) handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /find/persons", s.findPersons)
	mux.HandleFunc("GET /find/organizations", s.findOrganizations)
	return mux
}

// listen serves on addr until ctx is done or the process gets Ctrl+C.
func (s *server) listen(ctx context.Context, addr string) error {
	ctx, stop := signal.NotifyContext(ctx, os.Interrupt)
	defer stop()

	srv := &http.Server{
		Addr:              addr,
		Handler:           s.handler(),
		ReadHeaderTimeout: 10 * time.Second,
	}
	go func() {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		srv.Shutdown(shutdown)
	}()

	fmt.Fprintf(s.log, "Listening on %s: GET /find/persons and GET /find/organizations\n", addr)
	if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

// registerClient gives the Register client for env, and makes it the first
// time env is asked for.
func (s *server) registerClient(env string) (*register.Client, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if reg, ok := s.registers[env]; ok {
		return reg, nil
	}
	reg, err := newRegisterClient(env)
	if err != nil {
		return nil, err
	}
	s.registers[env] = reg
	return reg, nil
}

// findPersons is GET /find/persons. The query parameters are the flags of
// testudo find persons: count, kql, name, json, env, format and columns.
func (s *server) findPersons(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(s.log, "%s %s\n", r.Method, r.URL)
	query := r.URL.Query()

	if err := onlyParameters(query, "count", "kql", "name", "json", "env", "format", "columns"); err != nil {
		writeError(w, err)
		return
	}

	count, err := intParameter(query, "count", 1)
	if err != nil {
		writeError(w, err)
		return
	}
	name, err := boolParameter(query, "name")
	if err != nil {
		writeError(w, err)
		return
	}
	jsonOutput, err := boolParameter(query, "json")
	if err != nil {
		writeError(w, err)
		return
	}

	// The API answers CSV unless told otherwise, where the command prints
	// text. json=true still gives JSON, as --json does.
	format := query.Get("format")
	if format == "" && !jsonOutput {
		format = formatCSV
	}

	opts := &personsOptions{
		count:      count,
		kql:        query.Get("kql"),
		name:       name,
		jsonOutput: jsonOutput,
		env:        cmp.Or(query.Get("env"), defaultEnv),
		output: outputOptions{
			format:  format,
			columns: query.Get("columns"),
		},
	}

	if opts.count < 1 {
		writeError(w, fmt.Errorf("%w: count must be at least 1", errs.Invalid))
		return
	}
	if err := validateOutput(opts.output, opts.jsonOutput, personColumns, defaultPersonColumns); err != nil {
		writeError(w, err)
		return
	}
	reg, err := s.registerClient(opts.env)
	if err != nil {
		writeError(w, err)
		return
	}

	// The result is collected first, so an error halfway still gets an error
	// status rather than half a response.
	var out bytes.Buffer
	if err := runPersons(r.Context(), s.tenor, reg, &out, s.log, opts); err != nil {
		writeError(w, err)
		return
	}
	writeResult(w, opts.output.effectiveFormat(opts.jsonOutput), out.Bytes())
}

// findOrganizations is GET /find/organizations. The query parameters are the
// flags of testudo find organizations: count, unit-type, min-subunits,
// subunits, orgno, role, person-role, json, env, format and columns.
func (s *server) findOrganizations(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(s.log, "%s %s\n", r.Method, r.URL)
	query := r.URL.Query()

	if err := onlyParameters(query, "count", "unit-type", "min-subunits", "subunits", "orgno", "role", "person-role", "json", "env", "format", "columns"); err != nil {
		writeError(w, err)
		return
	}

	count, err := intParameter(query, "count", 10)
	if err != nil {
		writeError(w, err)
		return
	}
	minSubunits, err := intParameter(query, "min-subunits", 0)
	if err != nil {
		writeError(w, err)
		return
	}
	subunits, err := boolParameter(query, "subunits")
	if err != nil {
		writeError(w, err)
		return
	}
	jsonOutput, err := boolParameter(query, "json")
	if err != nil {
		writeError(w, err)
		return
	}

	// The API answers CSV unless told otherwise, where the command prints
	// text. json=true still gives JSON, as --json does.
	format := query.Get("format")
	if format == "" && !jsonOutput {
		format = formatCSV
	}

	opts := &organizationsOptions{
		count:               count,
		unitTypes:           listParameter(query, "unit-type"),
		subunits:            subunits,
		minSubunits:         minSubunits,
		organizationNumbers: listParameter(query, "orgno"),
		role:                query.Get("role"),
		personRole:          query.Get("person-role"),
		jsonOutput:          jsonOutput,
		env:                 cmp.Or(query.Get("env"), defaultEnv),
		output: outputOptions{
			format:  format,
			columns: query.Get("columns"),
		},
	}

	if err := opts.validate(query.Has("count")); err != nil {
		writeError(w, err)
		return
	}
	if err := validateOutput(opts.output, opts.jsonOutput, organizationColumns, defaultOrganizationColumns); err != nil {
		writeError(w, err)
		return
	}
	reg, err := s.registerClient(opts.env)
	if err != nil {
		writeError(w, err)
		return
	}

	// The result is collected first, so an error halfway still gets an error
	// status rather than half a response.
	var out bytes.Buffer
	if err := runOrganizations(r.Context(), s.tenor, reg, &out, s.log, opts); err != nil {
		writeError(w, err)
		return
	}
	writeResult(w, opts.output.effectiveFormat(opts.jsonOutput), out.Bytes())
}

// onlyParameters fails when the query has a parameter that is not allowed, so
// a misspelled flag is not silently ignored.
func onlyParameters(query url.Values, allowed ...string) error {
	for name := range query {
		if !slices.Contains(allowed, name) {
			slices.Sort(allowed)
			return fmt.Errorf("%w: unknown query parameter %q, use one of %s", errs.Invalid, name, strings.Join(allowed, ", "))
		}
	}
	return nil
}

// intParameter reads a number, or gives def when the parameter is missing.
func intParameter(query url.Values, name string, def int) (int, error) {
	if !query.Has(name) {
		return def, nil
	}
	n, err := strconv.Atoi(query.Get(name))
	if err != nil {
		return 0, fmt.Errorf("%w: %s must be a number, got %q", errs.Invalid, name, query.Get(name))
	}
	return n, nil
}

// boolParameter reads true or false. A parameter without a value is true, as
// a flag without a value is.
func boolParameter(query url.Values, name string) (bool, error) {
	if !query.Has(name) {
		return false, nil
	}
	if query.Get(name) == "" {
		return true, nil
	}
	b, err := strconv.ParseBool(query.Get(name))
	if err != nil {
		return false, fmt.Errorf("%w: %s must be true or false, got %q", errs.Invalid, name, query.Get(name))
	}
	return b, nil
}

// listParameter reads a list that is comma-separated, repeated or both, e.g.
// unit-type=AS,ENK or unit-type=AS&unit-type=ENK.
func listParameter(query url.Values, name string) []string {
	var list []string
	for _, value := range query[name] {
		for item := range strings.SplitSeq(value, ",") {
			if item = strings.TrimSpace(item); item != "" {
				list = append(list, item)
			}
		}
	}
	return list
}

// writeResult writes body with the content type of format.
func writeResult(w http.ResponseWriter, format string, body []byte) {
	switch format {
	case formatJSON:
		w.Header().Set("Content-Type", "application/json")
	case formatCSV:
		w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	default:
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	}
	w.Write(body)
}

// writeError writes err as {"error": "..."}, with a status that says whose
// fault it is.
func writeError(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	switch {
	case errors.Is(err, errs.Invalid):
		status = http.StatusBadRequest
	case errors.Is(err, errs.NotFound):
		status = http.StatusNotFound
	case errors.Is(err, errs.Connection), errors.Is(err, errs.InvalidResponse):
		status = http.StatusBadGateway
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}
