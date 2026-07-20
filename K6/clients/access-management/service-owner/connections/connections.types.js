/**
 * @typedef {string} ServiceOwnerConnectionPartyUrn
 */

/**
 * @typedef {string} AccessPackageUrn
 */

/**
 * @typedef {Object} ServiceOwnerAccessPackageDelegation
 * @property {ServiceOwnerConnectionPartyUrn} from Party URN the delegation is created from.
 * @property {ServiceOwnerConnectionPartyUrn} to Party URN the delegation is created to.
 * @property {AccessPackageUrn} packageUrn Access package URN.
 */

/**
 * @typedef {Object} AssignmentPackageDto
 * @property {string} id Assignment package identifier.
 * @property {string} assignmentId Assignment identifier.
 * @property {string} packageId Package identifier.
 */

/**
 * @typedef {Object} AltinnProblemDetails
 * @property {string|null} type Problem type.
 * @property {string|null} title Problem title.
 * @property {number|null} status HTTP status code.
 * @property {string|null} detail Problem details.
 * @property {string|null} instance Problem instance.
 * @property {ErrorCode|null} code Error code.
 */
