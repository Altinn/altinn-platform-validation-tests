/**
 * Query parameters for retrieving authorized parties.
 *
 * These parameters control which access information is included in the response.
 *
 * @typedef {object} AuthorizedPartiesQuery
 * @property {boolean} [includeAltinn2] Include parties with Altinn 2 access information.
 * @property {boolean} [includeAltinn3] Include parties with Altinn 3 access information.
 * @property {boolean} [includeRoles] Include authorized roles for each party.
 * @property {boolean} [includeAccessPackages] Include authorized access packages for each party.
 * @property {boolean} [includeResources] Include authorized resources for each party.
 * @property {boolean} [includeInstances] Include authorized instances for each party.
 * @property {"false"|"true"|"auto"} [includePartiesViaKeyRoles] Include parties accessible through key roles.
 * @property {"false"|"true"|"auto"} [includeSubParties] Include sub parties in the hierarchy.
 * @property {"false"|"true"|"auto"} [includeInactiveParties] Include inactive parties.
 * @property {string} [orgCode] Filter results to parties relevant for a specific resource owner organization code.
 * @property {Array<string>} [anyOfResourceIds] Filter results to parties where the subject has access to one or more resources.
 */

/**
 * Request body for retrieving authorized parties for a subject.
 *
 * @typedef {object} AuthorizedPartiesRequest
 * @property {string} type Subject identifier type URN.
 * Example: "urn:altinn:person:identifier-no"
 * @property {string} value Subject identifier value.
 * Example: "01017012345"
 * @property {Array<UrnAttribute>|null} [partyFilter] Optional filter limiting the lookup to specific parties.
 */

/**
 * Attribute represented by a URN type and value.
 *
 * @typedef {object} UrnAttribute
 * @property {string} type URN type identifier.
 * Example: "urn:altinn:organization:identifier-no"
 * @property {string} value URN value.
 * Example: "991825827"
 */

/**
 * Represents an authorized resource instance.
 *
 * @typedef {object} AuthorizedResource
 * @property {string|null} resourceId Resource identifier.
 * @property {string|null} instanceId Instance identifier.
 * @property {string|null} instanceRef Instance reference URN.
 */

/**
 * Represents a party the subject is authorized to represent.
 *
 * @typedef {object} AuthorizedParty
 * @property {string} partyUuid Party UUID.
 * @property {string} name Party name.
 * @property {string|null} organizationNumber Organization number.
 * @property {string|null} personId National identity number.
 * @property {string|null} dateOfBirth Date of birth (yyyy-MM-dd).
 * @property {"Person"|"Organization"|"SelfIdentified"} type Party type.
 * @property {number} partyId Internal party identifier.
 * @property {string|null} emailId Email identifier.
 * @property {string|null} unitType Unit type.
 * @property {boolean} isDeleted Indicates whether the party is deleted.
 * @property {boolean} onlyHierarchyElementWithNoAccess Indicates whether this hierarchy element has no access itself.
 * @property {Array<string>|null} authorizedResources Authorized resource identifiers.
 * @property {Array<string>|null} authorizedAccessPackages Authorized access package identifiers.
 * @property {Array<string>|null} authorizedRoles Authorized role identifiers.
 * @property {Array<AuthorizedResource>|null} authorizedInstances Authorized resource instances.
 * @property {Array<AuthorizedParty>|null} subunits Authorized sub-units.
 */

/**
 * Represents a Maskinporten delegation.
 *
 * @typedef {object} MaskinportenDelegation
 * @property {string|null} consumer_org Consumer organization.
 * @property {string|null} supplier_org Supplier organization.
 * @property {string|null} delegation_scheme_Id Delegation scheme identifier.
 * @property {Array<string>|null} scopes Delegated scopes.
 * @property {string|null} created Delegation creation timestamp.
 * @property {string|null} resourceid Resource identifier.
 */

/**
 * RFC7807 problem details response.
 *
 * @typedef {object} ProblemDetails
 * @property {string|null} type Problem type URI.
 * @property {string|null} title Problem title.
 * @property {number|null} status HTTP status code.
 * @property {string|null} detail Detailed problem description.
 * @property {string|null} instance Request instance identifier.
 */

/**
 * Validation error response.
 *
 * @typedef {object} ValidationProblemDetails
 * @property {string|null} type Problem type URI.
 * @property {string|null} title Problem title.
 * @property {number|null} status HTTP status code.
 * @property {string|null} traceId Request trace identifier.
 * @property {{[key: string]: Array<string>}} errors Validation errors keyed by field name.
 */

/**
 * Response containing authorized parties.
 *
 * @typedef {Array<AuthorizedParty>} AuthorizedPartiesResponse
 */

/**
 * Response containing Maskinporten delegations.
 *
 * @typedef {Array<MaskinportenDelegation>} MaskinportenDelegationsResponse
 */

export const AuthorizedPartiesQuery = undefined;
export const AuthorizedPartiesRequest = undefined;
export const UrnAttribute = undefined;
export const AuthorizedResource = undefined;
export const AuthorizedParty = undefined;
export const MaskinportenDelegation = undefined;
export const ProblemDetails = undefined;
export const ValidationProblemDetails = undefined;

export const AuthorizedPartiesResponse = undefined;
export const MaskinportenDelegationsResponse = undefined;
