// Package register is a client for Register's access management endpoints
// (altinn-register: Controllers/AccessManagementController.cs), with models
// from Altinn.Register.Contracts.
package register

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

const accessManagementPath = "/register/api/v1/access-management/parties"

// MaxPerQuery is the highest number of URNs Register accepts in one query
// call (PARTY_QUERY_MAX_ITEMS).
const MaxPerQuery = 100

// PartyURN is a reference to a party, e.g.
// urn:altinn:person:identifier-no:01010112345.
type PartyURN string

func PersonURN(personIdentifier string) PartyURN {
	return PartyURN("urn:altinn:person:identifier-no:" + personIdentifier)
}

func OrganizationURN(organizationIdentifier string) PartyURN {
	return PartyURN("urn:altinn:organization:identifier-no:" + organizationIdentifier)
}

func PartyIDURN(partyID uint32) PartyURN {
	return PartyURN("urn:altinn:party:id:" + strconv.FormatUint(uint64(partyID), 10))
}

func PartyUUIDURN(partyUUID string) PartyURN {
	return PartyURN("urn:altinn:party:uuid:" + partyUUID)
}

func UserIDURN(userID uint32) PartyURN {
	return PartyURN("urn:altinn:user:id:" + strconv.FormatUint(uint64(userID), 10))
}

func UsernameURN(username string) PartyURN {
	return PartyURN("urn:altinn:party:username:" + username)
}

func IDPortenEmailURN(email string) PartyURN {
	return PartyURN("urn:altinn:person:idporten-email:" + email)
}

// Field is a field or a field group in the fields parameter
// (PartyFieldIncludes). Without fields, Register responds with identifiers and
// display name.
type Field string

const (
	FieldIdentifiers Field = "identifiers"
	FieldParty       Field = "party"
	FieldPerson      Field = "person"
	FieldOrg         Field = "org"
	FieldSI          Field = "si"
	FieldSysuser     Field = "sysuser"
	FieldUser        Field = "user"

	FieldDisplayName       Field = "display-name"
	FieldPersonName        Field = "person.name"
	FieldPersonDateOfBirth Field = "person.date-of-birth"
	FieldUserID            Field = "user.id"
	FieldUserName          Field = "user.name"
	// FieldOrgSubunits is rejected by the query endpoint.
	FieldOrgSubunits Field = "org.subunits"
)

// Party types in partyType. The list is not exhaustive.
const (
	PartyTypePerson             = "person"
	PartyTypeOrganization       = "organization"
	PartyTypeSelfIdentifiedUser = "self-identified-user"
	PartyTypeSystemUser         = "system-user"
	PartyTypeEnterpriseUser     = "enterprise-user"
)

// Party is a party as Register serves it. Which fields are set depends on
// partyType and on which fields were requested.
type Party struct {
	PartyUUID   string     `json:"partyUuid"`
	VersionID   uint64     `json:"versionId,omitempty"`
	Urn         string     `json:"urn,omitempty"`
	ExternalUrn string     `json:"externalUrn,omitempty"`
	PartyID     uint32     `json:"partyId,omitempty"`
	PartyType   string     `json:"partyType,omitempty"`
	DisplayName string     `json:"displayName,omitempty"`
	CreatedAt   string     `json:"createdAt,omitempty"`
	ModifiedAt  string     `json:"modifiedAt,omitempty"`
	IsDeleted   bool       `json:"isDeleted,omitempty"`
	DeletedAt   string     `json:"deletedAt,omitempty"`
	User        *PartyUser `json:"user,omitempty"`

	// Person and organization
	MailingAddress *MailingAddress `json:"mailingAddress,omitempty"`

	// Person
	PersonIdentifier string         `json:"personIdentifier,omitempty"`
	FirstName        string         `json:"firstName,omitempty"`
	MiddleName       string         `json:"middleName,omitempty"`
	LastName         string         `json:"lastName,omitempty"`
	ShortName        string         `json:"shortName,omitempty"`
	Address          *StreetAddress `json:"address,omitempty"`
	DateOfBirth      string         `json:"dateOfBirth,omitempty"`
	DateOfDeath      string         `json:"dateOfDeath,omitempty"`

	// Organization
	OrganizationIdentifier string          `json:"organizationIdentifier,omitempty"`
	UnitStatus             string          `json:"unitStatus,omitempty"`
	UnitType               string          `json:"unitType,omitempty"`
	TelephoneNumber        string          `json:"telephoneNumber,omitempty"`
	MobileNumber           string          `json:"mobileNumber,omitempty"`
	FaxNumber              string          `json:"faxNumber,omitempty"`
	EmailAddress           string          `json:"emailAddress,omitempty"`
	InternetAddress        string          `json:"internetAddress,omitempty"`
	BusinessAddress        *MailingAddress `json:"businessAddress,omitempty"`

	// Self-identified user
	SelfIdentifiedUserType string `json:"selfIdentifiedUserType,omitempty"`
	Email                  string `json:"email,omitempty"`

	// System user and enterprise user
	Owner          *PartyRef `json:"owner,omitempty"`
	SystemUserType string    `json:"systemUserType,omitempty"`
}

type PartyUser struct {
	UserID   uint32   `json:"userId,omitempty"`
	Username string   `json:"username,omitempty"`
	UserIDs  []uint32 `json:"userIds,omitempty"`
	// Usernames is not in the contract, but K6 has seen it in responses from
	// at22.
	Usernames []string `json:"usernames,omitempty"`
}

type PartyRef struct {
	PartyUUID string `json:"partyUuid"`
	Urn       string `json:"urn,omitempty"`
}

type StreetAddress struct {
	MunicipalNumber string `json:"municipalNumber,omitempty"`
	MunicipalName   string `json:"municipalName,omitempty"`
	StreetName      string `json:"streetName,omitempty"`
	HouseNumber     string `json:"houseNumber,omitempty"`
	HouseLetter     string `json:"houseLetter,omitempty"`
	PostalCode      string `json:"postalCode,omitempty"`
	City            string `json:"city,omitempty"`
}

type MailingAddress struct {
	Address    string `json:"address,omitempty"`
	PostalCode string `json:"postalCode,omitempty"`
	City       string `json:"city,omitempty"`
}

// TokenSource gives a valid platform access token.
type TokenSource interface {
	Token(ctx context.Context) (string, error)
}

// Client calls Register through APIM. The access management endpoints take a
// platform access token in the header PlatformAccessToken, not a bearer
// token.
type Client struct {
	baseURL         string
	subscriptionKey string
	http            *http.Client
	tokens          TokenSource
}

// NewClient creates a client. baseURL is e.g.
// https://platform.at22.altinn.cloud, and subscriptionKey is sent as
// Ocp-Apim-Subscription-Key.
func NewClient(baseURL, subscriptionKey string, tokens TokenSource) *Client {
	return &Client{
		baseURL:         strings.TrimRight(baseURL, "/"),
		subscriptionKey: subscriptionKey,
		http:            &http.Client{Timeout: 10 * time.Second},
		tokens:          tokens,
	}
}

// QueryParties looks up parties with POST /parties/query. More than 100 URNs
// are split into several calls. Parties that do not exist are simply left out
// of the response.
func (c *Client) QueryParties(ctx context.Context, urns []PartyURN, fields ...Field) ([]Party, error) {
	parties := []Party{}
	for start := 0; start < len(urns); start += MaxPerQuery {
		batch := urns[start:min(start+MaxPerQuery, len(urns))]
		body, err := json.Marshal(map[string][]PartyURN{"data": batch})
		if err != nil {
			return nil, fmt.Errorf("%w: %v", errs.Invalid, err)
		}
		var response struct {
			Data *[]Party `json:"data"`
		}
		err = c.do(ctx, http.MethodPost, accessManagementPath+"/query", fields, body, &response)
		if errors.Is(err, errNoContent) {
			continue
		}
		if err != nil {
			return nil, err
		}
		if response.Data == nil {
			return nil, fmt.Errorf("%w: the Register response has no data", errs.InvalidResponse)
		}
		parties = append(parties, *response.Data...)
	}
	return parties, nil
}

// GetParty gets one party with GET /parties/{uuid}.
func (c *Client) GetParty(ctx context.Context, partyUUID string, fields ...Field) (*Party, error) {
	var p Party
	err := c.do(ctx, http.MethodGet, accessManagementPath+"/"+url.PathEscape(partyUUID), fields, nil, &p)
	if errors.Is(err, errNoContent) {
		return nil, fmt.Errorf("%w: Register responded with no content for %s", errs.InvalidResponse, partyUUID)
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// errNoContent means that Register responded 204 No Content.
var errNoContent = errors.New("no content")

var norwegianIdentifierRe = regexp.MustCompile(`^(\d{9}|\d{11})$`)

// LookupIdentifiers looks up fødselsnumre (11 digits) and organization numbers
// (9 digits) and returns the parties per identifier. Identifiers that do not
// exist are not in the result.
func (c *Client) LookupIdentifiers(ctx context.Context, identifiers []string, fields ...Field) (map[string]Party, error) {
	seen := map[string]bool{}
	urns := []PartyURN{}
	for _, id := range identifiers {
		if !norwegianIdentifierRe.MatchString(id) {
			return nil, fmt.Errorf("%w: %q is neither a fødselsnummer (11 digits) nor an organization number (9 digits)", errs.Invalid, id)
		}
		if seen[id] {
			continue
		}
		seen[id] = true
		if len(id) == 9 {
			urns = append(urns, OrganizationURN(id))
		} else {
			urns = append(urns, PersonURN(id))
		}
	}

	parties, err := c.QueryParties(ctx, urns, fields...)
	if err != nil {
		return nil, err
	}
	result := make(map[string]Party, len(parties))
	for _, p := range parties {
		id := p.PersonIdentifier
		if id == "" {
			id = p.OrganizationIdentifier
		}
		if !seen[id] {
			return nil, fmt.Errorf("%w: Register responded with a party we did not ask for (%q)", errs.InvalidResponse, id)
		}
		result[id] = p
	}
	return result, nil
}

func (c *Client) do(ctx context.Context, method, path string, fields []Field, body []byte, out any) error {
	token, err := c.tokens.Token(ctx)
	if err != nil {
		return fmt.Errorf("get platform token: %w", err)
	}

	u := c.baseURL + path
	if len(fields) > 0 {
		parts := make([]string, len(fields))
		for i, f := range fields {
			parts[i] = string(f)
		}
		u += "?" + url.Values{"fields": {strings.Join(parts, ",")}}.Encode()
	}

	var r io.Reader
	if body != nil {
		r = bytes.NewReader(body)
	}
	req, err := http.NewRequestWithContext(ctx, method, u, r)
	if err != nil {
		return fmt.Errorf("%w: %v", errs.Invalid, err)
	}
	req.Header.Set("PlatformAccessToken", token)
	req.Header.Set("Ocp-Apim-Subscription-Key", c.subscriptionKey)
	req.Header.Set("Accept", "application/json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("%w: Register: %v", errs.Connection, err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("%w: Register: read response: %v", errs.Connection, err)
	}
	if resp.StatusCode == http.StatusNotFound {
		return fmt.Errorf("%w: Register %s %s", errs.NotFound, method, path)
	}
	if resp.StatusCode == http.StatusNoContent {
		return errNoContent
	}
	// 206 Partial Content is a valid response from query.
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return fmt.Errorf("%w: Register responded HTTP %d to %s %s: %s",
			errs.InvalidResponse, resp.StatusCode, method, path, strings.TrimSpace(string(data)))
	}
	if err := json.Unmarshal(data, out); err != nil {
		return fmt.Errorf("%w: Register: %v", errs.InvalidResponse, err)
	}
	return nil
}
