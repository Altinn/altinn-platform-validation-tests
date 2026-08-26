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
export const ServiceOwnerAccessPackageDelegation = undefined;
export const ServiceOwnerConnectionPartyUrn = undefined;
