// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link GetResourceOwners}.
 *
 * Use {@link GetResourceOwnersQueryBuilder} to construct this object.
 *
 * @typedef {object} GetResourceOwnersQuery
 * @property {Array<ResourceType>} [relevantResourceTypes] Resource types to
 * include.
 */

/**
 * Query parameters for {@link GetResource}.
 *
 * Use {@link GetResourceQueryBuilder} to construct this object.
 *
 * @typedef {object} GetResourceQuery
 * @property {string} [resourceId] Resource identifier.
 */

/**
 * Query parameters for {@link SearchResources}.
 *
 * Use {@link SearchResourcesQueryBuilder} to construct this object.
 *
 * @typedef {object} SearchResourcesQuery
 * @property {string} [SearchString] Free text search string.
 * @property {Array<string>} [ROFilters] Resource owner org codes to filter by.
 * @property {boolean} [IncludeA2Services] Whether to include Altinn 2
 * services.
 * @property {boolean} [IncludeExpired] Whether to include expired resources.
 * @property {number} [ResultsPerPage] Page size of the search result.
 * @property {number} [Page] Page number of the search result.
 */

export const GetResourceOwnersQuery = undefined;
export const GetResourceQuery = undefined;
export const SearchResourcesQuery = undefined;
