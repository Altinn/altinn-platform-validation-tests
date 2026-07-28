/**
 * Metadata describing a role.
 *
 * @typedef {object} RoleDto
 * @property {string} id Unique role identifier (UUID).
 * @property {string|null} name Display name of the role.
 * @property {string|null} code Role code.
 * @property {string|null} description Description of the role.
 * @property {boolean} isKeyRole Indicates whether this is a key role.
 * @property {string|null} urn Role URN identifier.
 * @property {string|null} legacyRoleCode Legacy role code.
 * @property {string|null} legacyUrn Legacy role URN identifier.
 * @property {boolean} isResourcePolicyAvailable Indicates whether resource policy is available.
 * @property {ProviderDto} provider Role provider.
 * @property {boolean|null} isRevocable Indicates whether the role can be revoked.
 */

/**
 * Metadata describing a provider.
 *
 * @typedef {object} ProviderDto
 * @property {string} id Provider identifier (UUID).
 * @property {string|null} name Provider name.
 * @property {string|null} refId Provider reference identifier.
 * @property {string|null} logoUrl Provider logo URL.
 * @property {string|null} code Provider code.
 * @property {string} typeId Provider type identifier (UUID).
 * @property {ProviderTypeDto} type Provider type.
 */

/**
 * Metadata describing a provider type.
 *
 * @typedef {object} ProviderTypeDto
 * @property {string} id Provider type identifier (UUID).
 * @property {string|null} name Provider type name.
 */

/**
 * Metadata describing an access package.
 *
 * @typedef {object} PackageDto
 * @property {string} id Package identifier (UUID).
 * @property {string|null} name Package name.
 * @property {string|null} urn Package URN.
 * @property {string|null} description Package description.
 * @property {boolean} isDelegable Indicates whether the package can be delegated.
 * @property {boolean} isAssignable Indicates whether the package can be assigned.
 * @property {boolean} isResourcePolicyAvailable Indicates whether resource policy is available.
 * @property {AreaDto} area Package area.
 * @property {TypeDto} type Package type.
 * @property {Array<ResourceDto>|null} resources Resources included in the package.
 */

/**
 * Metadata describing a resource.
 *
 * @typedef {object} ResourceDto
 * @property {string} id Resource identifier (UUID).
 * @property {string} providerId Provider identifier (UUID).
 * @property {string} typeId Resource type identifier (UUID).
 * @property {string|null} name Resource name.
 * @property {string|null} description Resource description.
 * @property {string|null} refId Resource reference identifier.
 * @property {ProviderDto} provider Resource provider.
 * @property {ResourceTypeDto} type Resource type.
 */

/**
 * Metadata describing a resource type.
 *
 * @typedef {object} ResourceTypeDto
 * @property {string} id Resource type identifier (UUID).
 * @property {string|null} name Resource type name.
 */

/**
 * Metadata describing an area.
 *
 * @typedef {object} AreaDto
 * @property {string} id Area identifier (UUID).
 * @property {string|null} name Area name.
 * @property {string|null} urn Area URN.
 * @property {string|null} description Area description.
 * @property {string|null} iconUrl Area icon URL.
 * @property {Array<PackageDto>|null} packages Packages in the area.
 * @property {AreaGroupDto} group Area group.
 */

/**
 * Metadata describing an area group.
 *
 * @typedef {object} AreaGroupDto
 * @property {string} id Area group identifier (UUID).
 * @property {string|null} name Area group name.
 * @property {string|null} urn Area group URN.
 * @property {string|null} description Area group description.
 * @property {string|null} type Area group type.
 * @property {Array<AreaDto>|null} areas Areas in this group.
 */

/**
 * Metadata describing a type.
 *
 * @typedef {object} TypeDto
 * @property {string} id Type identifier (UUID).
 * @property {string} providerId Provider identifier (UUID).
 * @property {string|null} name Type name.
 * @property {ProviderDto} provider Type provider.
 */

/**
 * Metadata describing a subtype.
 *
 * @typedef {object} SubTypeDto
 * @property {string} id Subtype identifier (UUID).
 * @property {string} typeId Parent type identifier (UUID).
 * @property {string|null} name Subtype name.
 * @property {string|null} description Subtype description.
 * @property {TypeDto} type Parent type.
 */

/**
 * Search result wrapper for packages.
 *
 * @typedef {object} PackageDtoSearchObject
 * @property {PackageDto} object Package result.
 * @property {number} score Search score.
 * @property {Array<SearchField>|null} fields Matched fields.
 */

/**
 * Search field metadata.
 *
 * @typedef {object} SearchField
 * @property {string|null} field Field name.
 * @property {string|null} value Matched value.
 * @property {number} score Match score.
 * @property {Array<SearchWord>|null} words Matched words.
 */

/**
 * Search word metadata.
 *
 * @typedef {object} SearchWord
 * @property {string|null} content Word content.
 * @property {string|null} lowercaseContent Lowercase word content.
 * @property {boolean} isMatch Whether the word matched.
 * @property {number} score Match score.
 */

/**
 * GET /meta/info/roles
 *
 * Response: RoleDto[]
 *
 * @typedef {Array<RoleDto>} RolesResponse
 */

/**
 * GET /meta/info/roles/{id}
 *
 * Response: RoleDto
 *
 * @typedef {RoleDto} RoleResponse
 */

/**
 * GET /meta/info/roles/packages
 *
 * Response: PackageDto
 *
 * @typedef {PackageDto} RolePackagesResponse
 */

/**
 * GET /meta/info/roles/resources
 *
 * Response: ResourceDto
 *
 * @typedef {ResourceDto} RoleResourcesResponse
 */

/**
 * GET /meta/info/roles/{id}/packages
 *
 * Response: PackageDto
 *
 * @typedef {PackageDto} RolePackagesByRoleResponse
 */

/**
 * GET /meta/info/roles/{id}/resources
 *
 * Response: ResourceDto
 *
 * @typedef {ResourceDto} RoleResourcesByRoleResponse
 */

// Dummy exports for VS Code / JSDoc autocomplete

export const RoleDto = undefined;
export const ProviderDto = undefined;
export const ProviderTypeDto = undefined;
export const PackageDto = undefined;
export const ResourceDto = undefined;
export const ResourceTypeDto = undefined;
export const AreaDto = undefined;
export const AreaGroupDto = undefined;
export const TypeDto = undefined;
export const SubTypeDto = undefined;
export const PackageDtoSearchObject = undefined;
export const SearchField = undefined;
export const SearchWord = undefined;

export const RolesResponse = undefined;
export const RoleResponse = undefined;
export const RolePackagesResponse = undefined;
export const RoleResourcesResponse = undefined;
export const RolePackagesByRoleResponse = undefined;
export const RoleResourcesByRoleResponse = undefined;
