/**
 * @typedef {Object} PartyUuidUrn
 * @property {"urn:altinn:party:uuid"} type
 * @property {string} value
 */

/**
 * @typedef {Object} OrganizationIdentifierUrn
 * @property {"urn:altinn:organization:identifier-no"} type
 * @property {string} value
 */

/**
 * @typedef {PartyUuidUrn|OrganizationIdentifierUrn} PartyUrnUrnJsonTypeValue
 */

/**
 * @typedef {Object} ActionIdUrn
 * @property {"urn:oasis:names:tc:xacml:1.0:action:action-id"} type
 * @property {string} value
 */

/**
 * @typedef {ActionIdUrn} ActionUrnUrnJsonTypeValue
 */

/**
 * @typedef {Object} UrnJsonTypeValue
 * @property {string} type
 * @property {string} value
 */

/**
 * @typedef {Object} RightDto
 * @property {Array<UrnJsonTypeValue>=} resource
 * @property {ActionUrnUrnJsonTypeValue=} action
 */

/**
 * @typedef {Object} AppsInstanceDelegationRequestDto
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
 * @typedef {Object} AttributeMatchExternal
 * @property {string} id
 * @property {string} value
 */

/**
 * @typedef {Object} DetailExternal
 * @property {DetailCodeExternal=} code
 * @property {string=} description
 * @property {Object<string, Array<AttributeMatchExternal>>=} parameters
 */

/**
 * @typedef {Object} RightDelegationResultDto
 * @property {Array<UrnJsonTypeValue>=} resource
 * @property {ActionUrnUrnJsonTypeValue=} action
 * @property {DelegationStatusExternal=} status
 */

/**
 * @typedef {Object} RightRevokeResultDto
 * @property {Array<UrnJsonTypeValue>=} resource
 * @property {ActionUrnUrnJsonTypeValue=} action
 * @property {RevokeStatusExternal=} status
 */

/**
 * @typedef {Object} ResourceRightDelegationCheckResultDto
 * @property {string} rightKey
 * @property {Array<UrnJsonTypeValue>} resource
 * @property {ActionUrnUrnJsonTypeValue} action
 * @property {DelegableStatusExternal} status
 * @property {Array<DetailExternal>=} details
 */

/**
 * @typedef {Object} AppsInstanceDelegationResponseDto
 * @property {PartyUrnUrnJsonTypeValue} from
 * @property {PartyUrnUrnJsonTypeValue} to
 * @property {string} resourceId
 * @property {string} instanceId
 * @property {Array<RightDelegationResultDto>} rights
 */

/**
 * @typedef {Object} AppsInstanceRevokeResponseDto
 * @property {PartyUrnUrnJsonTypeValue} from
 * @property {PartyUrnUrnJsonTypeValue} to
 * @property {string} resourceId
 * @property {string} instanceId
 * @property {Array<RightRevokeResultDto>} rights
 */

/**
 * @typedef {Object} PaginatedLinks
 * @property {string=} next
 */

/**
 * @typedef {Object} AppsInstanceDelegationResponseDtoPaginated
 * @property {Array<AppsInstanceDelegationResponseDto>=} data
 * @property {PaginatedLinks=} links
 */

/**
 * @typedef {Object} AppsInstanceRevokeResponseDtoPaginated
 * @property {Array<AppsInstanceRevokeResponseDto>=} data
 * @property {PaginatedLinks=} links
 */

/**
 * @typedef {Object} ResourceRightDelegationCheckResultDtoPaginated
 * @property {Array<ResourceRightDelegationCheckResultDto>=} data
 * @property {PaginatedLinks=} links
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
