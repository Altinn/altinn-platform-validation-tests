/**
 * @typedef {string} ServiceOwnerConnectionPartyUrn
 */

/**
 * @typedef {string} AccessPackageUrn
 */

/**
 * @typedef {object} ServiceOwnerAccessPackageDelegation
 * @property {ServiceOwnerConnectionPartyUrn} from Party URN the delegation is created from.
 * @property {ServiceOwnerConnectionPartyUrn} to Party URN the delegation is created to.
 * @property {AccessPackageUrn} packageUrn Access package URN.
 */

/**
 * @typedef {object} AssignmentPackageDto
 * @property {string} id Assignment package identifier.
 * @property {string} assignmentId Assignment identifier.
 * @property {string} packageId Package identifier.
 */

/**
 * Query parameters for retrieving resource rights.
 *
 * Use {@link GetResourceRightsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetResourceRightsQuery
 * @property {string|null} [resource] Resource identifier.
 */

/**
 * @typedef {object} AttributeDto
 * @property {string|null} type Attribute type.
 * @property {string|null} value Attribute value.
 */

/**
 * @typedef {object} RightDto
 * @property {string|null} key Right key.
 * @property {string|null} name Right name.
 * @property {Array<AttributeDto>|null} resource Resource attributes.
 * @property {AttributeDto|null} action Action attribute.
 */

/**
 * @typedef {object} RightKeyListDto
 * @property {Array<string>|null} directRightKeys Direct right keys.
 */

/**
 * @typedef {object} ServiceOwnerResourceDelegation
 * @property {ServiceOwnerConnectionPartyUrn} from Party URN the delegation is created from.
 * @property {ServiceOwnerConnectionPartyUrn} to Party URN the delegation is created to.
 * @property {string|null} resource Resource identifier.
 * @property {RightKeyListDto|null} [rightKeys] Rights to delegate or revoke.
 */

/**
 * @typedef {object} AssignmentResourceDto
 * @property {string} id Assignment resource identifier.
 * @property {string} assignmentId Assignment identifier.
 * @property {string} resourceId Resource identifier.
 */

/**
 * @typedef {object} AltinnProblemDetails
 * @property {string|null} type Problem type.
 * @property {string|null} title Problem title.
 * @property {number|null} status HTTP status code.
 * @property {string|null} detail Problem details.
 * @property {string|null} instance Problem instance.
 * @property {string|null} code Error code.
 */

export const AccessPackageUrn = undefined;
export const AssignmentPackageDto = undefined;
export const AssignmentResourceDto = undefined;
export const GetResourceRightsQuery = undefined;
export const RightDto = undefined;
export const RightKeyListDto = undefined;
export const ServiceOwnerAccessPackageDelegation = undefined;
export const ServiceOwnerConnectionPartyUrn = undefined;
export const ServiceOwnerResourceDelegation = undefined;
