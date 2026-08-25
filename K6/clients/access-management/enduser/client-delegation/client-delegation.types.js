// -----------------------------------------------------------------------------
// Response models
// -----------------------------------------------------------------------------

/**
 * @typedef {object} PaginatedResultLinks
 * @property {string|null} next Link to the next page of results.
 */

/**
 * @typedef {object} CompactRoleDto
 * @property {string} id UUID.
 * @property {string|null} code
 * @property {string|null} urn
 * @property {string|null} legacyurn
 * @property {Array<CompactRoleDto>|null} children
 */

/**
 * @typedef {object} CompactPackageDto
 * @property {string} id UUID.
 * @property {string|null} urn
 * @property {string} areaId UUID.
 */

/**
 * @typedef {object} CompactEntityDto
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {CompactEntityDto|null} parent
 * @property {Array<CompactEntityDto>|null} children
 * @property {number|null} partyid
 * @property {number|null} userId
 * @property {string|null} username
 * @property {string|null} organizationIdentifier
 * @property {string|null} personIdentifier
 * @property {string|null} dateOfBirth ISO date.
 * @property {string|null} dateOfDeath ISO date.
 * @property {boolean} isDeleted
 * @property {string|null} deletedAt ISO date-time.
 */

/**
 * Access packages granted through a single role.
 *
 * @typedef {object} RoleAccessPackagesDto
 * @property {CompactRoleDto} role
 * @property {Array<CompactPackageDto>|null} packages
 */

/**
 * A client, with the access the agent holds for it.
 *
 * @typedef {object} ClientDto
 * @property {CompactEntityDto} client
 * @property {Array<RoleAccessPackagesDto>|null} access
 */

/**
 * An agent, with the access delegated to it.
 *
 * @typedef {object} AgentDto
 * @property {CompactEntityDto} agent
 * @property {string} agentAddedAt ISO date-time.
 * @property {Array<RoleAccessPackagesDto>|null} access
 */

/**
 * The clients a party has through a given client provider.
 *
 * @typedef {object} MyClientDto
 * @property {CompactEntityDto} provider
 * @property {Array<ClientDto>|null} clients
 */

/**
 * @typedef {object} MyClientDtoPaginatedResult
 * @property {Array<MyClientDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {object} ClientDtoPaginatedResult
 * @property {Array<ClientDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {object} AgentDtoPaginatedResult
 * @property {Array<AgentDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * A single delegation result entry.
 *
 * @typedef {object} DelegationDto
 * @property {string} roleId UUID.
 * @property {string} packageId UUID.
 * @property {string} viaId UUID.
 * @property {string} fromId UUID.
 * @property {string} toId UUID.
 * @property {boolean} changed Whether the delegation was changed by the request.
 */

/**
 * An assignment created between two parties.
 *
 * @typedef {object} AssignmentDto
 * @property {string} id UUID.
 * @property {string} roleId UUID.
 * @property {string} fromId UUID.
 * @property {string} toId UUID.
 */

// -----------------------------------------------------------------------------
// Request models
// -----------------------------------------------------------------------------

/**
 * A role with the access packages to delegate or revoke for it.
 *
 * @typedef {object} DelegationBatchPermission
 * @property {string|null} role Role code.
 * @property {Array<string>|null} packages Access package URNs.
 */

/**
 * Batch of role and access package permissions.
 *
 * Use {@link DelegationBatchInputBuilder} to construct this object.
 *
 * @typedef {object} DelegationBatchInputDto
 * @property {Array<DelegationBatchPermission>|null} values Permissions to apply.
 */

/**
 * A person to add as an agent.
 *
 * Use {@link PersonInputBuilder} to construct this object.
 *
 * @typedef {object} PersonInput
 * @property {string|null} personIdentifier
 * Either an 11-digit national identity number or a username.
 * @property {string|null} lastName Last name of the person.
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for retrieving the clients of the authenticated party.
 *
 * Use {@link MyClientsQueryBuilder} to construct this object.
 *
 * @typedef {object} MyClientsQuery
 * @property {Array<string>} [provider] Client provider UUIDs to filter by.
 */

/**
 * Query parameters for revoking access to clients of the authenticated party.
 *
 * Use {@link DeleteMyClientsQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteMyClientsQuery
 * @property {string} provider Client provider UUID.
 * @property {string} from Client party UUID.
 * @property {boolean} [cascade] Also revoke delegations derived from the access.
 */

/**
 * Query parameters for removing a client provider of the authenticated party.
 *
 * Use {@link DeleteMyClientProviderQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteMyClientProviderQuery
 * @property {string} provider Client provider UUID.
 */

/**
 * Query parameters for revoking access packages on a client of the
 * authenticated party.
 *
 * Use {@link DeleteMyClientAccessPackagesQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteMyClientAccessPackagesQuery
 * @property {string} provider Client provider UUID.
 * @property {string} from Client party UUID.
 */

/**
 * Query parameters for retrieving the clients of a party.
 *
 * Use {@link ClientsQueryBuilder} to construct this object.
 *
 * @typedef {object} ClientsQuery
 * @property {string} party Party UUID.
 * @property {Array<string>} [roles] Role codes to filter by.
 */

/**
 * Query parameters for retrieving the agents of a party.
 *
 * Use {@link AgentsQueryBuilder} to construct this object.
 *
 * @typedef {object} AgentsQuery
 * @property {string} party Party UUID.
 */

/**
 * Query parameters for adding an agent to a party.
 *
 * Use {@link CreateAgentQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateAgentQuery
 * @property {string} party Party UUID.
 * @property {string} [to] Party UUID of an existing person to add as agent.
 */

/**
 * Query parameters for removing an agent from a party.
 *
 * Use {@link DeleteAgentQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteAgentQuery
 * @property {string} party Party UUID.
 * @property {string} to Agent party UUID.
 * @property {boolean} [cascade] Also revoke delegations held by the agent.
 */

/**
 * Query parameters for revoking an agent's access to a client.
 *
 * Use {@link DeleteAgentClientsQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteAgentClientsQuery
 * @property {string} party Party UUID.
 * @property {string} from Client party UUID.
 * @property {string} to Agent party UUID.
 * @property {boolean} [cascade] Also revoke delegations derived from the access.
 */

/**
 * Query parameters for retrieving the access packages of an agent.
 *
 * Use {@link AgentAccessPackagesQueryBuilder} to construct this object.
 *
 * @typedef {object} AgentAccessPackagesQuery
 * @property {string} party Party UUID.
 * @property {string} to Agent party UUID.
 */

/**
 * Query parameters for delegating or revoking access packages for an agent
 * on a specific client.
 *
 * Use {@link AgentClientAccessPackagesQueryBuilder} to construct this object.
 *
 * @typedef {object} AgentClientAccessPackagesQuery
 * @property {string} party Party UUID.
 * @property {string} from Client party UUID.
 * @property {string} to Agent party UUID.
 */

/**
 * Query parameters for retrieving the access packages held on a client.
 *
 * Use {@link ClientAccessPackagesQueryBuilder} to construct this object.
 *
 * @typedef {object} ClientAccessPackagesQuery
 * @property {string} party Party UUID.
 * @property {string} from Client party UUID.
 */

export const AgentAccessPackagesQuery = undefined;
export const AgentClientAccessPackagesQuery = undefined;
export const AgentDtoPaginatedResult = undefined;
export const AgentsQuery = undefined;
export const ClientAccessPackagesQuery = undefined;
export const ClientDtoPaginatedResult = undefined;
export const ClientsQuery = undefined;
export const CreateAgentQuery = undefined;
export const DelegationBatchInputDto = undefined;
export const DeleteAgentClientsQuery = undefined;
export const DeleteAgentQuery = undefined;
export const DeleteMyClientAccessPackagesQuery = undefined;
export const DeleteMyClientProviderQuery = undefined;
export const DeleteMyClientsQuery = undefined;
export const MyClientDtoPaginatedResult = undefined;
export const MyClientsQuery = undefined;
export const PersonInput = undefined;
