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
 * @typedef {Object} ConsentResourceAttributeDto
 * @property {string|null} type
 * @property {string|null} value
 */

/**
 * @typedef {Object} ConsentRightDto
 * @property {Array<string>|null} action
 * @property {Array<ConsentResourceAttributeDto>|null} resource
 * @property {{[key:string]: string}|null} metadata
 */

/**
 * @typedef {Object} ConsentRequestDto
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
 * @typedef {Object} ConsentRequestEventDto
 * @property {string} consentEventID
 * @property {string} created
 * @property {string|null} performedBy
 * @property {ConsentRequestEventType} eventType
 * @property {string} consentRequestID
 */

/**
 * @typedef {Object} ConsentRequestDetailsDto
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
 * @typedef {Object} ConsentStatusChangeDto
 * @property {string} consentRequestId
 * @property {string|null} eventType
 * @property {string} changedDate
 */

/**
 * @typedef {Object} PaginatedResultLinks
 * @property {string|null} next
 */

/**
 * @typedef {Object} ConsentStatusChangeDtoPaginatedResult
 * @property {Array<ConsentStatusChangeDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {Object} ProblemDetails
 * @property {string|null} type
 * @property {string|null} title
 * @property {number|null} status
 * @property {string|null} detail
 * @property {string|null} instance
 */


/**
 * Builder for creating ConsentRequestDto payloads.
 *
 * @typedef {Object} ConsentRequestBuilder
 * @property {Object} request The underlying consent request payload.
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
 * @typedef {Object} ConsentRequestEventsQueryBuilder
 * @property {Object} query The underlying query parameter object.
 * @property {string} [query.continuationToken] Pagination continuation token.
 * @property {string} [query.createdAfter] Filter events created after this timestamp.
 * @property {string} [query.createdBefore] Filter events created before this timestamp.
 * @property {Array<string>} [query.eventType] Event type filters.
 * @property {string} [query.consentRequestId] Consent request UUID filter.
 */
