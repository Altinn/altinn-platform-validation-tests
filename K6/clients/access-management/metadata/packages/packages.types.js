/**
 * @typedef {object} SearchWord
 * @property {string|null} content
 * @property {string|null} lowercaseContent
 * @property {boolean} isMatch
 * @property {number} score
 */

/**
 * @typedef {object} SearchField
 * @property {string|null} field
 * @property {string|null} value
 * @property {number} score
 * @property {Array<SearchWord>|null} words
 */

/**
 * @typedef {object} PackageDtoSearchObject
 * @property {import("../roles/roles.types.js").PackageDto} object
 * @property {number} score
 * @property {Array<SearchField>|null} fields
 */

/**
 * Query parameters for {@link PackagesSearchQueryBuilder}.
 *
 * @typedef {object} PackagesSearchQuery
 * @property {string} [term] Search term.
 * @property {Array<string>} [resourceProviderCode] Resource provider code filters.
 * @property {boolean} [searchInResources] Whether to search in resources.
 * @property {string} [typeName] Package type name filter.
 * @property {boolean} [simpleSearch] Whether to use simple search.
 * @property {boolean} [strict] Whether to use strict matching.
 */

/**
 * Builder for creating query parameters for searching access packages.
 *
 * @typedef {object} PackagesSearchQueryBuilder
 * @property {PackagesSearchQuery} query The underlying query parameter object.
 */

export const PackageDtoSearchObject = undefined;
export const PackagesSearchQuery = undefined;
export const PackagesSearchQueryBuilder = undefined;
