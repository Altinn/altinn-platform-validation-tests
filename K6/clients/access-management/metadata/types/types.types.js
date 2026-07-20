/**
 * @typedef {Object} ProviderTypeDto
 * @property {string} id
 * @property {string|null} name
 */

/**
 * @typedef {Object} ProviderDto
 * @property {string} id
 * @property {string|null} name
 * @property {string|null} refId
 * @property {string|null} logoUrl
 * @property {string|null} code
 * @property {string} typeId
 * @property {ProviderTypeDto} type
 */

/**
 * @typedef {Object} TypeDto
 * @property {string} id
 * @property {string} providerId
 * @property {string|null} name
 * @property {ProviderDto} provider
 */

/**
 * @typedef {Object} SubTypeDto
 * @property {string} id
 * @property {string} typeId
 * @property {string|null} name
 * @property {string|null} description
 * @property {TypeDto} type
 */
