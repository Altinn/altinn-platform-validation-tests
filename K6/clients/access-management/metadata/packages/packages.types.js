/**
 * @typedef {Object} SearchWord
 * @property {string|null} content
 * @property {string|null} lowercaseContent
 * @property {boolean} isMatch
 * @property {number} score
 */

/**
 * @typedef {Object} SearchField
 * @property {string|null} field
 * @property {string|null} value
 * @property {number} score
 * @property {Array<SearchWord>|null} words
 */

/**
 * @typedef {Object} PackageDtoSearchObject
 * @property {PackageDto} object
 * @property {number} score
 * @property {Array<SearchField>|null} fields
 */

/**
 * Builder for creating query parameters for searching access packages.
 *
 * @typedef {Object} PackagesSearchQueryBuilder
 * @property {Object} query The underlying query parameter object.
 * @property {string} [query.term] Search term.
 * @property {Array<string>} [query.resourceProviderCode] Resource provider code filters.
 * @property {boolean} [query.searchInResources] Whether to search in resources.
 * @property {string} [query.typeName] Package type name filter.
 * @property {boolean} [query.simpleSearch] Whether to use simple search.
 * @property {boolean} [query.strict] Whether to use strict matching.
 */
