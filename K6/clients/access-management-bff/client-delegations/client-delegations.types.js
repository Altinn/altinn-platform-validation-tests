// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link GetMyClients}.
 *
 * Use {@link GetMyClientsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetMyClientsQuery
 * @property {Array<string>} [provider] Client provider UUIDs to filter by.
 */

/**
 * Query parameters for {@link DeleteMyClients}.
 *
 * Use {@link DeleteMyClientsQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteMyClientsQuery
 * @property {string} [provider] Client provider UUID.
 * @property {string} [from] Client party UUID.
 */

/**
 * Query parameters for {@link DeleteMyClientProviders}.
 *
 * Use {@link DeleteMyClientProvidersQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteMyClientProvidersQuery
 * @property {string} [provider] Client provider UUID.
 */

/**
 * Query parameters for {@link GetClients}.
 *
 * Use {@link GetClientsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetClientsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {Array<string>} [roles] Role codes to filter by.
 */

/**
 * Query parameters for {@link GetAgents}.
 *
 * Use {@link GetAgentsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetAgentsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 */

/**
 * Query parameters for {@link CreateAgent}.
 *
 * Use {@link CreateAgentQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateAgentQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Party UUID of the person to add as agent.
 */

/**
 * Query parameters for {@link DeleteAgent}.
 *
 * Use {@link DeleteAgentQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteAgentQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Agent party UUID.
 */

/**
 * Query parameters for {@link GetAgentAccessPackages}.
 *
 * Use {@link GetAgentAccessPackagesQueryBuilder} to construct this object.
 *
 * @typedef {object} GetAgentAccessPackagesQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Agent party UUID.
 */

/**
 * Query parameters for {@link CreateAgentAccessPackages}.
 *
 * Use {@link CreateAgentAccessPackagesQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateAgentAccessPackagesQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Client party UUID.
 * @property {string} [to] Agent party UUID.
 */

/**
 * Query parameters for {@link DeleteAgentAccessPackages}.
 *
 * Use {@link DeleteAgentAccessPackagesQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteAgentAccessPackagesQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Client party UUID.
 * @property {string} [to] Agent party UUID.
 */

/**
 * Query parameters for {@link GetClientAccessPackages}.
 *
 * Use {@link GetClientAccessPackagesQueryBuilder} to construct this object.
 *
 * @typedef {object} GetClientAccessPackagesQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Client party UUID.
 */

/**
 * Query parameters for {@link GetAgentResources}.
 *
 * Use {@link GetAgentResourcesQueryBuilder} to construct this object.
 *
 * @typedef {object} GetAgentResourcesQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Agent party UUID.
 */

/**
 * Query parameters for {@link CreateAgentResources}.
 *
 * Use {@link CreateAgentResourcesQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateAgentResourcesQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Client party UUID.
 * @property {string} [to] Agent party UUID.
 */

/**
 * Query parameters for {@link DeleteAgentResources}.
 *
 * Use {@link DeleteAgentResourcesQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteAgentResourcesQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Client party UUID.
 * @property {string} [to] Agent party UUID.
 */

/**
 * Query parameters for {@link GetClientResources}.
 *
 * Use {@link GetClientResourcesQueryBuilder} to construct this object.
 *
 * @typedef {object} GetClientResourcesQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Client party UUID.
 */

/**
 * Query parameters for {@link DeleteMyClientResources}.
 *
 * Use {@link DeleteMyClientResourcesQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteMyClientResourcesQuery
 * @property {string} [provider] Client provider UUID.
 * @property {string} [from] Client party UUID.
 */

export const CreateAgentAccessPackagesQuery = undefined;
export const CreateAgentQuery = undefined;
export const CreateAgentResourcesQuery = undefined;
export const DeleteAgentAccessPackagesQuery = undefined;
export const DeleteAgentQuery = undefined;
export const DeleteAgentResourcesQuery = undefined;
export const DeleteMyClientProvidersQuery = undefined;
export const DeleteMyClientResourcesQuery = undefined;
export const DeleteMyClientsQuery = undefined;
export const GetAgentAccessPackagesQuery = undefined;
export const GetAgentResourcesQuery = undefined;
export const GetAgentsQuery = undefined;
export const GetClientAccessPackagesQuery = undefined;
export const GetClientResourcesQuery = undefined;
export const GetClientsQuery = undefined;
export const GetMyClientsQuery = undefined;
