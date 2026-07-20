/**
 * @typedef {Object} AreaGroupDto
 * @property {string} id
 * @property {string|null} name
 * @property {string|null} urn
 * @property {string|null} description
 * @property {string|null} type
 * @property {Array<AreaDto>|null} areas
 */

/**
 * @typedef {Object} AreaDto
 * @property {string} id
 * @property {string|null} name
 * @property {string|null} urn
 * @property {string|null} description
 * @property {string|null} iconUrl
 * @property {Array<PackageDto>|null} packages
 * @property {AreaGroupDto} group
 */

/**
 * @typedef {Object} ResourceTypeDto
 * @property {string} id
 * @property {string|null} name
 */

/**
 * @typedef {Object} RoleDto
 * @property {string} id
 * @property {string|null} name
 * @property {string|null} code
 * @property {string|null} description
 * @property {boolean} isKeyRole
 * @property {string|null} urn
 * @property {string|null} legacyRoleCode
 * @property {string|null} legacyUrn
 * @property {boolean} isResourcePolicyAvailable
 * @property {ProviderDto} provider
 * @property {boolean|null} isRevocable
 */

/**
 * @typedef {Object} PackageDto
 * @property {string} id
 * @property {string|null} name
 * @property {string|null} urn
 * @property {string|null} description
 * @property {boolean} isDelegable
 * @property {boolean} isAssignable
 * @property {boolean} isResourcePolicyAvailable
 * @property {AreaDto} area
 * @property {TypeDto} type
 * @property {Array<ResourceDto>|null} resources
 */

/**
 * @typedef {Object} ResourceDto
 * @property {string} id
 * @property {string} providerId
 * @property {string} typeId
 * @property {string|null} name
 * @property {string|null} description
 * @property {string|null} refId
 * @property {ProviderDto} provider
 * @property {ResourceTypeDto} type
 */
