/**
 * @typedef {"Hide"|"Show"} ConsentPortalViewMode
 */

/**
 * @typedef {"Hide"|"Show"|null} NullableOfConsentPortalViewMode
 */

/**
 * @typedef {"Created"|"Rejected"|"Accepted"|"Revoked"|"Deleted"|"Expired"|"Used"} ConsentRequestEventType
 */

/**
 * @typedef {"Created"|"Rejected"|"Accepted"|"Revoked"|"Deleted"} ConsentRequestStatusType
 */

/**
 * @typedef {object} ConsentResourceAttributeDto
 * @property {string|null} type
 * @property {string|null} value
 */

/**
 * @typedef {object} ConsentRightDto
 * @property {Array<string>|null} action
 * @property {Array<ConsentResourceAttributeDto>|null} resource
 * @property {{[key:string]: string}|null} metadata
 */

/**
 * @typedef {object} ConsentRequestDto
 * @property {string} id
 * @property {string|null} from
 * @property {string|null} requiredDelegator
 * @property {string|null} to
 * @property {string} validTo
 * @property {Array<ConsentRightDto>|null} consentRights
 * @property {{[key:string]: string}|null} requestMessage
 * @property {string|null} redirectUrl
 * @property {NullableOfConsentPortalViewMode} portalViewMode
 */

/**
 * @typedef {object} ConsentRequestEventDto
 * @property {string} consentEventID
 * @property {string} created
 * @property {string|null} performedBy
 * @property {ConsentRequestEventType} eventType
 * @property {string} consentRequestID
 */

/**
 * @typedef {object} ConsentRequestDetailsDto
 * @property {string} id
 * @property {string|null} from
 * @property {string|null} to
 * @property {string|null} requiredDelegator
 * @property {string|null} handledBy
 * @property {string} validTo
 * @property {Array<ConsentRightDto>|null} consentRights
 * @property {{[key:string]: string}|null} requestMessage
 * @property {ConsentRequestStatusType} status
 * @property {string|null} consented
 * @property {string|null} redirectUrl
 * @property {Array<ConsentRequestEventDto>|null} consentRequestEvents
 * @property {string|null} viewUri
 * @property {ConsentPortalViewMode} portalViewMode
 */

/**
 * @typedef {object} ConsentStatusChangeDto
 * @property {string} consentRequestId
 * @property {string|null} eventType
 * @property {string} changedDate
 */

/**
 * @typedef {object} PaginatedResultLinks
 * @property {string|null} next
 */

/**
 * @typedef {object} ConsentStatusChangeDtoPaginatedResult
 * @property {Array<ConsentStatusChangeDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {object} ProblemDetails
 * @property {string|null} type
 * @property {string|null} title
 * @property {number|null} status
 * @property {string|null} detail
 * @property {string|null} instance
 */

/**
 * Builder for creating ConsentRequestDto payloads.
 *
 * @typedef {object} ConsentRequestBuilder
 * @property {object} request The underlying consent request payload.
 * @property {string|null} request.id Consent request UUID.
 * @property {string|null} request.from Party URN the consent request is created from.
 * @property {string|null} request.requiredDelegator Required delegator party URN.
 * @property {string|null} request.to Party URN the consent request is created for.
 * @property {string|null} request.validTo Consent expiration date/time.
 * @property {Array<ConsentRightDto>|null} request.consentRights Consent rights included in the request.
 * @property {{[key:string]: string}|null} request.requestMessage Localized request message.
 * @property {string|null} request.redirectUrl Redirect URL after consent handling.
 * @property {ConsentPortalViewMode|null} request.portalViewMode Portal view mode.
 */

/**
 * Builder for creating query parameters for retrieving consent request events.
 *
 * @typedef {object} ConsentRequestEventsQueryBuilder
 * @property {object} query The underlying query parameter object.
 * @property {string} [query.continuationToken] Pagination continuation token.
 * @property {string} [query.createdAfter] Filter events created after this timestamp.
 * @property {string} [query.createdBefore] Filter events created before this timestamp.
 * @property {Array<string>} [query.eventType] Event type filters.
 * @property {string} [query.consentRequestId] Consent request UUID filter.
 */

// Runtime stubs for the typedefs above, the way v2/types.js does it. A typedef on
// its own is invisible to an importer, so a file documenting one of these has
// nothing to import and no editor can follow the name back here. The two builder
// typedefs are left out on purpose, since those names belong to the real classes in
// consent-enterprise.builders.js.
export const ConsentPortalViewMode = undefined;
export const ConsentRequestDetailsDto = undefined;
export const ConsentRequestDto = undefined;
export const ConsentRequestEventDto = undefined;
export const ConsentRequestEventType = undefined;
export const ConsentRequestStatusType = undefined;
export const ConsentResourceAttributeDto = undefined;
export const ConsentRightDto = undefined;
export const ConsentStatusChangeDto = undefined;
export const ConsentStatusChangeDtoPaginatedResult = undefined;
export const NullableOfConsentPortalViewMode = undefined;
export const PaginatedResultLinks = undefined;
export const ProblemDetails = undefined;
