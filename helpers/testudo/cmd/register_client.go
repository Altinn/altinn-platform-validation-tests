package cmd

// Klient for Register sine access-management-endepunkter
// (altinn-register: Controllers/AccessManagementController.cs), med modeller
// fra Altinn.Register.Contracts.

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
)

const registerAccessManagementPath = "/register/api/v1/access-management/parties"

// RegisterMaksPerQuery er det høyeste antallet URN-er Register tar i ett
// query-kall (PARTY_QUERY_MAX_ITEMS).
const RegisterMaksPerQuery = 100

// PartyUrn er en referanse til en part, f.eks.
// urn:altinn:person:identifier-no:01010112345.
type PartyUrn string

func PersonUrn(foedselsnummer string) PartyUrn {
	return PartyUrn("urn:altinn:person:identifier-no:" + foedselsnummer)
}

func OrganisasjonUrn(organisasjonsnummer string) PartyUrn {
	return PartyUrn("urn:altinn:organization:identifier-no:" + organisasjonsnummer)
}

func PartyIDUrn(partyID uint32) PartyUrn {
	return PartyUrn("urn:altinn:party:id:" + strconv.FormatUint(uint64(partyID), 10))
}

func PartyUUIDUrn(partyUUID string) PartyUrn {
	return PartyUrn("urn:altinn:party:uuid:" + partyUUID)
}

func BrukerIDUrn(userID uint32) PartyUrn {
	return PartyUrn("urn:altinn:user:id:" + strconv.FormatUint(uint64(userID), 10))
}

func BrukernavnUrn(brukernavn string) PartyUrn {
	return PartyUrn("urn:altinn:party:username:" + brukernavn)
}

func IdportenEpostUrn(epost string) PartyUrn {
	return PartyUrn("urn:altinn:person:idporten-email:" + epost)
}

// PartyFelt er et felt eller en feltgruppe i fields-parameteren
// (PartyFieldIncludes). Uten felt svarer Register med identifikatorer og
// visningsnavn.
type PartyFelt string

const (
	FeltIdentifiers PartyFelt = "identifiers"
	FeltParty       PartyFelt = "party"
	FeltPerson      PartyFelt = "person"
	FeltOrg         PartyFelt = "org"
	FeltSI          PartyFelt = "si"
	FeltSysuser     PartyFelt = "sysuser"
	FeltUser        PartyFelt = "user"

	FeltDisplayName       PartyFelt = "display-name"
	FeltPersonName        PartyFelt = "person.name"
	FeltPersonDateOfBirth PartyFelt = "person.date-of-birth"
	FeltUserID            PartyFelt = "user.id"
	FeltUserName          PartyFelt = "user.name"
	// FeltOrgSubunits avvises av query-endepunktet.
	FeltOrgSubunits PartyFelt = "org.subunits"
)

// Partytyper i partyType. Listen er ikke uttømmende.
const (
	PartyTypePerson             = "person"
	PartyTypeOrganization       = "organization"
	PartyTypeSelfIdentifiedUser = "self-identified-user"
	PartyTypeSystemUser         = "system-user"
	PartyTypeEnterpriseUser     = "enterprise-user"
)

// Party er en part slik Register serverer den. Feltene som er satt avhenger
// av partyType og av hvilke felt som ble bedt om.
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

	// Person og organisasjon
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

	// Organisasjon
	OrganizationIdentifier string          `json:"organizationIdentifier,omitempty"`
	UnitStatus             string          `json:"unitStatus,omitempty"`
	UnitType               string          `json:"unitType,omitempty"`
	TelephoneNumber        string          `json:"telephoneNumber,omitempty"`
	MobileNumber           string          `json:"mobileNumber,omitempty"`
	FaxNumber              string          `json:"faxNumber,omitempty"`
	EmailAddress           string          `json:"emailAddress,omitempty"`
	InternetAddress        string          `json:"internetAddress,omitempty"`
	BusinessAddress        *MailingAddress `json:"businessAddress,omitempty"`

	// Selvidentifisert bruker
	SelfIdentifiedUserType string `json:"selfIdentifiedUserType,omitempty"`
	Email                  string `json:"email,omitempty"`

	// Systembruker og virksomhetsbruker
	Owner          *PartyRef `json:"owner,omitempty"`
	SystemUserType string    `json:"systemUserType,omitempty"`
}

type PartyUser struct {
	UserID   uint32   `json:"userId,omitempty"`
	Username string   `json:"username,omitempty"`
	UserIDs  []uint32 `json:"userIds,omitempty"`
	// Usernames står ikke i kontrakten, men K6 har sett det i svar fra at22.
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

// RegisterClient kaller Register gjennom APIM. Access-management-endepunktene
// tar et platform access token i headeren PlatformAccessToken, ikke et
// bearer-token.
type RegisterClient struct {
	baseURL         string
	subscriptionKey string
	http            *http.Client
	tokens          TokenSource
}

// NewRegisterClient lager en klient. baseURL er f.eks.
// https://platform.at22.altinn.cloud, og subscriptionKey sendes som
// Ocp-Apim-Subscription-Key.
func NewRegisterClient(baseURL, subscriptionKey string, tokens TokenSource) *RegisterClient {
	return &RegisterClient{
		baseURL:         strings.TrimRight(baseURL, "/"),
		subscriptionKey: subscriptionKey,
		http:            newClient(),
		tokens:          tokens,
	}
}

// QueryParties slår opp parter med POST /parties/query. Over 100 URN-er deles
// opp i flere kall. Parter som ikke finnes er bare utelatt fra svaret.
func (c *RegisterClient) QueryParties(ctx context.Context, urns []PartyUrn, felt ...PartyFelt) ([]Party, error) {
	parter := []Party{}
	for start := 0; start < len(urns); start += RegisterMaksPerQuery {
		batch := urns[start:min(start+RegisterMaksPerQuery, len(urns))]
		body, err := json.Marshal(map[string][]PartyUrn{"data": batch})
		if err != nil {
			return nil, fmt.Errorf("%w: %v", ErrInvalid, err)
		}
		var svar struct {
			Data *[]Party `json:"data"`
		}
		err = c.gjoer(ctx, http.MethodPost, registerAccessManagementPath+"/query", felt, body, &svar)
		if errors.Is(err, errIngenInnhold) {
			continue
		}
		if err != nil {
			return nil, err
		}
		if svar.Data == nil {
			return nil, fmt.Errorf("%w: Register-svaret mangler data", ErrInvalidResponse)
		}
		parter = append(parter, *svar.Data...)
	}
	return parter, nil
}

// HentParty henter én part med GET /parties/{uuid}.
func (c *RegisterClient) HentParty(ctx context.Context, partyUUID string, felt ...PartyFelt) (*Party, error) {
	var p Party
	err := c.gjoer(ctx, http.MethodGet, registerAccessManagementPath+"/"+url.PathEscape(partyUUID), felt, nil, &p)
	if errors.Is(err, errIngenInnhold) {
		return nil, fmt.Errorf("%w: Register svarte uten innhold for %s", ErrInvalidResponse, partyUUID)
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// errIngenInnhold betyr at Register svarte 204 No Content.
var errIngenInnhold = errors.New("ingen innhold")

var norskIdentifikatorRe = regexp.MustCompile(`^(\d{9}|\d{11})$`)

// SlaaOppIdentifikatorer slår opp fødselsnumre (11 siffer) og
// organisasjonsnumre (9 siffer) og returnerer partene per identifikator.
// Identifikatorer som ikke finnes er ikke med i svaret.
func (c *RegisterClient) SlaaOppIdentifikatorer(ctx context.Context, identifikatorer []string, felt ...PartyFelt) (map[string]Party, error) {
	sett := map[string]bool{}
	urns := []PartyUrn{}
	for _, id := range identifikatorer {
		if !norskIdentifikatorRe.MatchString(id) {
			return nil, fmt.Errorf("%w: %q er verken fødselsnummer (11 siffer) eller organisasjonsnummer (9 siffer)", ErrInvalid, id)
		}
		if sett[id] {
			continue
		}
		sett[id] = true
		if len(id) == 9 {
			urns = append(urns, OrganisasjonUrn(id))
		} else {
			urns = append(urns, PersonUrn(id))
		}
	}

	parter, err := c.QueryParties(ctx, urns, felt...)
	if err != nil {
		return nil, err
	}
	resultat := make(map[string]Party, len(parter))
	for _, p := range parter {
		id := p.PersonIdentifier
		if id == "" {
			id = p.OrganizationIdentifier
		}
		if !sett[id] {
			return nil, fmt.Errorf("%w: Register svarte med en part vi ikke ba om (%q)", ErrInvalidResponse, id)
		}
		resultat[id] = p
	}
	return resultat, nil
}

func (c *RegisterClient) gjoer(ctx context.Context, metode, sti string, felt []PartyFelt, body []byte, ut any) error {
	token, err := c.tokens.Token(ctx)
	if err != nil {
		return fmt.Errorf("hent platform-token: %w", err)
	}

	u := c.baseURL + sti
	if len(felt) > 0 {
		deler := make([]string, len(felt))
		for i, f := range felt {
			deler[i] = string(f)
		}
		u += "?" + url.Values{"fields": {strings.Join(deler, ",")}}.Encode()
	}

	var r io.Reader
	if body != nil {
		r = bytes.NewReader(body)
	}
	req, err := http.NewRequestWithContext(ctx, metode, u, r)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrInvalid, err)
	}
	req.Header.Set("PlatformAccessToken", token)
	req.Header.Set("Ocp-Apim-Subscription-Key", c.subscriptionKey)
	req.Header.Set("Accept", "application/json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("%w: Register: %v", ErrConnection, err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("%w: Register: les svar: %v", ErrConnection, err)
	}
	if resp.StatusCode == http.StatusNotFound {
		return fmt.Errorf("%w: Register %s %s", ErrNotFound, metode, sti)
	}
	if resp.StatusCode == http.StatusNoContent {
		return errIngenInnhold
	}
	// 206 Partial Content er et gyldig svar fra query.
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return fmt.Errorf("%w: Register svarte HTTP %d på %s %s: %s",
			ErrInvalidResponse, resp.StatusCode, metode, sti, strings.TrimSpace(string(data)))
	}
	if err := json.Unmarshal(data, ut); err != nil {
		return fmt.Errorf("%w: Register: %v", ErrInvalidResponse, err)
	}
	return nil
}
