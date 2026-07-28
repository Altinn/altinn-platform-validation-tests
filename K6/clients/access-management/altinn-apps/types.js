/**
 * @typedef {object} PartyUuidUrn
 * @property {"urn:altinn:party:uuid"} type
 * @property {string} value
 */

/**
 * @typedef {object} OrganizationIdentifierUrn
 * @property {"urn:altinn:organization:identifier-no"} type
 * @property {string} value
 */

/**
 * @typedef {PartyUuidUrn|OrganizationIdentifierUrn} PartyUrnUrnJsonTypeValue
 */

/**
 * @typedef {object} ActionIdUrn
 * @property {"urn:oasis:names:tc:xacml:1.0:action:action-id"} type
 * @property {string} value
 */

/**
 * @typedef {ActionIdUrn} ActionUrnUrnJsonTypeValue
 */

/**
 * @typedef {object} UrnJsonTypeValue
 * @property {string} type
 * @property {string} value
 */

/**
 * @typedef {object} RightDto
 * @property {Array<UrnJsonTypeValue>=} resource
 * @property {ActionUrnUrnJsonTypeValue=} action
 */

/**
 * @typedef {object} AppsInstanceDelegationRequestDto
 * @property {PartyUrnUrnJsonTypeValue} from
 * @property {PartyUrnUrnJsonTypeValue} to
 * @property {Array<RightDto>} rights
 */

/**
 * @typedef {"Delegated"|"NotDelegated"} DelegationStatusExternal
 */

/**
 * @typedef {"Delegable"|"NotDelegable"} DelegableStatusExternal
 */

/**
 * @typedef {"Revoked"|"NotRevoked"} RevokeStatusExternal
 */

/**
 * @typedef {"Unknown"|
 * "RoleAccess"|
 * "DelegationAccess"|
 * "SrrRightAccess"|
 * "MissingRoleAccess"|
 * "MissingDelegationAccess"|
 * "MissingSrrRightAccess"|
 * "InsufficientAuthenticationLevel"|
 * "AlreadyDelegated"|
 * "AccessListValidationPass"|
 * "AccessListValidationFail"} DetailCodeExternal
 */

/**
 * @typedef {object} AttributeMatchExternal
 * @property {string} id
 * @property {string} value
 */

/**
 * @typedef {object} DetailExternal
 * @property {DetailCodeExternal=} code
 * @property {string=} description
 * @property {{[key: string]: Array<AttributeMatchExternal>}=} parameters
 */

/**
 * @typedef {object} RightDelegationResultDto
 * @property {Array<UrnJsonTypeValue>=} resource
 * @property {ActionUrnUrnJsonTypeValue=} action
 * @property {DelegationStatusExternal=} status
 */

/**
 * @typedef {object} RightRevokeResultDto
 * @property {Array<UrnJsonTypeValue>=} resource
 * @property {ActionUrnUrnJsonTypeValue=} action
 * @property {RevokeStatusExternal=} status
 */

/**
 * @typedef {object} ResourceRightDelegationCheckResultDto
 * @property {string} rightKey
 * @property {Array<UrnJsonTypeValue>} resource
 * @property {ActionUrnUrnJsonTypeValue} action
 * @property {DelegableStatusExternal} status
 * @property {Array<DetailExternal>=} details
 */

/**
 * @typedef {object} AppsInstanceDelegationResponseDto
 * @property {PartyUrnUrnJsonTypeValue} from
 * @property {PartyUrnUrnJsonTypeValue} to
 * @property {string} resourceId
 * @property {string} instanceId
 * @property {Array<RightDelegationResultDto>} rights
 */

/**
 * @typedef {object} AppsInstanceRevokeResponseDto
 * @property {PartyUrnUrnJsonTypeValue} from
 * @property {PartyUrnUrnJsonTypeValue} to
 * @property {string} resourceId
 * @property {string} instanceId
 * @property {Array<RightRevokeResultDto>} rights
 */

/**
 * @typedef {object} PaginatedLinks
 * @property {string=} next
 */

/**
 * @typedef {object} AppsInstanceDelegationResponseDtoPaginated
 * @property {Array<AppsInstanceDelegationResponseDto>=} data
 * @property {PaginatedLinks=} links
 */

/**
 * @typedef {object} AppsInstanceRevokeResponseDtoPaginated
 * @property {Array<AppsInstanceRevokeResponseDto>=} data
 * @property {PaginatedLinks=} links
 */

/**
 * @typedef {object} ResourceRightDelegationCheckResultDtoPaginated
 * @property {Array<ResourceRightDelegationCheckResultDto>=} data
 * @property {PaginatedLinks=} links
 */

/**
 * Error body returned for 400 and 500 responses.
 *
 * @typedef {object} ProblemDetails
 * @property {string=} type
 * @property {string=} title
 * @property {number=} status
 * @property {string=} detail
 * @property {string=} instance
 */

export const PartyUuidUrn = undefined;
export const OrganizationIdentifierUrn = undefined;
export const PartyUrnUrnJsonTypeValue = undefined;

export const ActionIdUrn = undefined;
export const ActionUrnUrnJsonTypeValue = undefined;

export const UrnJsonTypeValue = undefined;

export const RightDto = undefined;

export const AppsInstanceDelegationRequestDto = undefined;

export const DelegationStatusExternal = undefined;
export const DelegableStatusExternal = undefined;
export const RevokeStatusExternal = undefined;
export const DetailCodeExternal = undefined;

export const AttributeMatchExternal = undefined;
export const DetailExternal = undefined;

export const RightDelegationResultDto = undefined;
export const RightRevokeResultDto = undefined;

export const ResourceRightDelegationCheckResultDto = undefined;

export const AppsInstanceDelegationResponseDto = undefined;
export const AppsInstanceRevokeResponseDto = undefined;

export const PaginatedLinks = undefined;

export const AppsInstanceDelegationResponseDtoPaginated = undefined;
export const AppsInstanceRevokeResponseDtoPaginated = undefined;
export const ResourceRightDelegationCheckResultDtoPaginated = undefined;

export const ProblemDetails = undefined;
