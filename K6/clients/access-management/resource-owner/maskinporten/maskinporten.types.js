/**
 * Query parameters for retrieving Maskinporten delegations.
 *
 * Use {@link MaskinportenDelegationsQueryBuilder} to construct this object.
 *
 * @typedef {object} MaskinportenDelegationsQuery
 * @property {string} [supplierOrg] Organization number of the supplier.
 * @property {string} [consumerOrg] Organization number of the consumer.
 * @property {string} [scope] Maskinporten scope, e.g. altinn:instances.read.
 */

/**
 * A single Maskinporten delegation.
 *
 * Property names follow the snake_case casing used by the API.
 *
 * @typedef {object} MaskinportenDelegation
 * @property {string|null} consumer_org Organization number of the consumer.
 * @property {string|null} supplier_org Organization number of the supplier.
 * @property {string|null} delegation_scheme_Id Delegation scheme UUID.
 * @property {Array<string>|null} scopes Delegated scopes.
 * @property {string|null} created ISO date-time the delegation was created.
 * @property {string|null} resourceid Resource identifier.
 */
