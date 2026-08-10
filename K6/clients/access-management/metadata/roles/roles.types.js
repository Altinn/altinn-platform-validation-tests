/**
 * @typedef {object} AreaGroupDto
 * @property {string} id
 * @property {string|null} name
 * @property {string|null} urn
 * @property {string|null} description
 * @property {string|null} type
 * @property {Array<AreaDto>|null} areas
 */

/**
 * @typedef {object} AreaDto
 * @property {string} id
 * @property {string|null} name
 * @property {string|null} urn
 * @property {string|null} description
 * @property {string|null} iconUrl
 * @property {Array<PackageDto>|null} packages
 * @property {AreaGroupDto} group
 */

/**
 * @typedef {object} ResourceTypeDto
 * @property {string} id
 * @property {string|null} name
 */

/**
 * @typedef {object} RoleDto
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
 * @typedef {object} PackageDto
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
 * @typedef {object} ResourceDto
 * @property {string} id
 * @property {string} providerId
 * @property {string} typeId
 * @property {string|null} name
 * @property {string|null} description
 * @property {string|null} refId
 * @property {ProviderDto} provider
 * @property {ResourceTypeDto} type
 */
