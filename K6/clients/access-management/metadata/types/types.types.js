/**
 * @typedef {object} ProviderTypeDto
 * @property {string} id
 * @property {string|null} name
 */

/**
 * @typedef {object} ProviderDto
 * @property {string} id
 * @property {string|null} name
 * @property {string|null} refId
 * @property {string|null} logoUrl
 * @property {string|null} code
 * @property {string} typeId
 * @property {ProviderTypeDto} type
 */

/**
 * @typedef {object} TypeDto
 * @property {string} id
 * @property {string} providerId
 * @property {string|null} name
 * @property {ProviderDto} provider
 */

/**
 * @typedef {object} SubTypeDto
 * @property {string} id
 * @property {string} typeId
 * @property {string|null} name
 * @property {string|null} description
 * @property {TypeDto} type
 */

export const ProviderDto = undefined;
export const SubTypeDto = undefined;
export const TypeDto = undefined;
