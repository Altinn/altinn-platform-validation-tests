// -----------------------------------------------------------------------------
// Response models
// -----------------------------------------------------------------------------

/**
 * @typedef {object} CompactResourceDto
 * @property {string} id UUID.
 * @property {string} refId Reference id, the identifier a delegation is asked for by.
 */

/**
 * One role, and the resources reached through it.
 *
 * @typedef {object} ResourceAccess
 * @property {import("../client-delegation/client-delegation.types.js").CompactRoleDto} role The role the access comes from.
 * @property {Array<CompactResourceDto>} resources The resources the role reaches.
 */

/**
 * Resources a client has delegated, grouped by the role they came through.
 *
 * @typedef {object} ClientResourcesDto
 * @property {import("../client-delegation/client-delegation.types.js").CompactEntityDto} client The client the resources belong to.
 * @property {Array<ResourceAccess>} access Access grouped by role.
 */

/**
 * Resources delegated to an agent, grouped by the role they came through.
 *
 * @typedef {object} AgentResourcesDto
 * @property {import("../client-delegation/client-delegation.types.js").CompactEntityDto} agent The agent the resources were delegated to.
 * @property {Array<ResourceAccess>} access Access grouped by role.
 */

/**
 * @typedef {object} ClientResourcesDtoPaginatedResult
 * @property {Array<ClientResourcesDto>} data The page of results.
 * @property {import("../client-delegation/client-delegation.types.js").PaginatedResultLinks|null} links Paging links.
 */

/**
 * @typedef {object} AgentResourcesDtoPaginatedResult
 * @property {Array<AgentResourcesDto>} data The page of results.
 * @property {import("../client-delegation/client-delegation.types.js").PaginatedResultLinks|null} links Paging links.
 */

/**
 * One delegation as the write endpoints echo it back.
 *
 * @typedef {object} ResourceDelegationDto
 * @property {string} roleId UUID of the role the resource was delegated through.
 * @property {string} resourceId UUID of the resource.
 * @property {string} viaId UUID of the client the delegation goes via.
 * @property {string} fromId UUID the delegation is from.
 * @property {string} toId UUID the delegation is to, the agent.
 * @property {boolean} changed Whether this call changed anything, false when it was already in that state.
 */

// -----------------------------------------------------------------------------
// Request models
// -----------------------------------------------------------------------------

/**
 * One role, and the resources to apply for it.
 *
 * @typedef {object} ResourceDelegationPermission
 * @property {string} role Role code, for instance regnskapsforer.
 * @property {Array<string>} resources Resource reference ids.
 */

/**
 * Body for delegating and removing resources. Prefer building it with
 * ResourceDelegationBatchInputBuilder.
 *
 * @typedef {object} ResourceDelegationBatchInputDto
 * @property {Array<ResourceDelegationPermission>} values The permissions to apply.
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * @typedef {object} AgentResourcesQuery
 * @property {string} party UUID of the party the agent belongs to.
 * @property {string} agent UUID of the agent.
 */

/**
 * @typedef {object} ClientResourcesQuery
 * @property {string} party UUID of the party the client belongs to.
 * @property {string} client UUID of the client.
 */

/**
 * @typedef {object} DelegateAgentResourcesQuery
 * @property {string} party UUID of the party delegating.
 * @property {string} client UUID of the client the resources come from.
 * @property {string} agent UUID of the agent the resources go to.
 */

// Runtime placeholders, so the typedefs above can be imported by name without
// k6 pulling in a binding that does not exist.
export const AgentResourcesDto = undefined;
export const AgentResourcesDtoPaginatedResult = undefined;
export const AgentResourcesQuery = undefined;
export const ClientResourcesDto = undefined;
export const ClientResourcesDtoPaginatedResult = undefined;
export const ClientResourcesQuery = undefined;
export const CompactResourceDto = undefined;
export const DelegateAgentResourcesQuery = undefined;
export const ResourceAccess = undefined;
export const ResourceDelegationBatchInputDto = undefined;
export const ResourceDelegationDto = undefined;
export const ResourceDelegationPermission = undefined;
