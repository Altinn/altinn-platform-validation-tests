/**
 * Represents a paginated response containing authorized parties.
 *
 * @typedef {object} AuthorizedPartyDtoListPaginatedResult
 * @property {Array<Array<AuthorizedPartyDto>>|null} data Authorized parties grouped by result page.
 * @property {PaginatedResultLinks} links Pagination links.
 */

/**
 * Pagination links for paginated API responses.
 *
 * @typedef {object} PaginatedResultLinks
 * @property {string|null} next Link to the next page of results.
 */

/**
 * Represents an authorized party available to the end user.
 *
 * @typedef {object} AuthorizedPartyDto
 * @property {string} partyUuid Unique party UUID.
 * @property {string|null} name Party name.
 * @property {string|null} organizationNumber Organization number.
 * @property {string|null} parentId Parent party UUID.
 * @property {string|null} personId Person identifier.
 * @property {string|null} dateOfBirth Date of birth.
 * @property {number} partyId Internal party identifier.
 * @property {string|null} emailId Email identifier.
 * @property {"None"|"Person"|"Organization"|"SelfIdentified"} type Party type.
 * @property {string|null} unitType Organization unit type.
 * @property {boolean} isDeleted Whether the party is deleted.
 * @property {boolean} onlyHierarchyElementWithNoAccess Whether this party exists only as a hierarchy element without access.
 * @property {Array<string>|null} authorizedAccessPackages Access packages granted for this party.
 * @property {Array<string>|null} authorizedResources Resources granted for this party.
 * @property {Array<string>|null} authorizedRoles Roles granted for this party.
 * @property {Array<AuthorizedPartyResourceInstance>|null} authorizedInstances Resource instances granted for this party.
 * @property {Array<AuthorizedPartyDto>|null} subunits Child parties in the hierarchy.
 */

/**
 * Represents an authorized resource instance.
 *
 * @typedef {object} AuthorizedPartyResourceInstance
 * @property {string|null} resourceId Resource identifier.
 * @property {string|null} instanceId Instance identifier.
 * @property {string|null} instanceRef Instance reference.
 */

/**
 * Query parameters for the end-user authorized parties endpoint.
 *
 * @typedef {object} EndUserAuthorizedPartiesQuery
 * @property {boolean} [includeRoles] Include authorized roles.
 * @property {boolean} [includeAccessPackages] Include authorized access packages.
 * @property {boolean} [includeResources] Include authorized resources.
 * @property {boolean} [includeInstances] Include authorized instances.
 * @property {"false"|"true"|"auto"} [includePartiesViaKeyRoles] Include parties through key roles.
 * @property {"false"|"true"|"auto"} [includeSubParties] Include sub parties.
 * @property {"false"|"true"|"auto"} [includeInactiveParties] Include inactive parties.
 * @property {Array<string>} [partyFilter] Filter by party UUIDs.
 * @property {Array<string>} [anyOfResourceIds] Filter by resource identifiers.
 */

export const AuthorizedPartyDtoListPaginatedResult = undefined;
export const PaginatedResultLinks = undefined;
export const AuthorizedPartyDto = undefined;
export const AuthorizedPartyResourceInstance = undefined;
export const EndUserAuthorizedPartiesQuery = undefined;
