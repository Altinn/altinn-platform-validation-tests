import { check } from "k6";

import { AgentDtoPaginatedResult, AgentResourcesDtoPaginatedResult, ClientDtoPaginatedResult, ClientResourcesDtoPaginatedResult, ResourceDelegationDto } from "../../../../clients/access-management/enduser/client-delegation-v2/client-delegation-v2.types.js";

/**
 * Collects every resource reference id in a paginated resources result.
 *
 * Both read endpoints share the same shape below the top level: a list of
 * entries, each with an access list that groups resources by role. Which key
 * holds the entity differs, client or agent, but the access list does not, so
 * one reader serves both.
 *
 * @param {ClientResourcesDtoPaginatedResult|AgentResourcesDtoPaginatedResult|null} resources - The result to read.
 * @returns {Array<string>} Every resource reference id in the result.
 */
function ResourceRefIds(resources) {
    return (resources?.data ?? [])
        .flatMap((entry) => entry?.access ?? [])
        .flatMap((access) => access?.resources ?? [])
        .map((resource) => resource?.refId)
        .filter((refId) => refId !== undefined && refId !== null);
}

/**
 * Collects the role codes a paginated resources result grants access through.
 *
 * @param {ClientResourcesDtoPaginatedResult|AgentResourcesDtoPaginatedResult|null} resources - The result to read.
 * @returns {Array<string>} Every role code in the result.
 */
function RoleCodes(resources) {
    return (resources?.data ?? [])
        .flatMap((entry) => entry?.access ?? [])
        .map((access) => access?.role?.code)
        .filter((code) => code !== undefined && code !== null);
}

/**
 * Checks that a resource is among the ones the result lists.
 *
 * @param {ClientResourcesDtoPaginatedResult|AgentResourcesDtoPaginatedResult|null} resources - The result to search.
 * @param {string} resourceRefId - Reference id of the resource that should be there.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if the resource is listed, false otherwise.
 */
function CheckResourceDelegated(resources, resourceRefId, operation) {
    const refIds = ResourceRefIds(resources);

    const success = check(resources, {
        [`CheckResourceDelegated - ${operation} lists the delegated resource`]: () =>
            refIds.includes(resourceRefId),
    });

    if (!success) {
        console.error(`CheckResourceDelegated - ${operation} expected ${resourceRefId} among: ${JSON.stringify(refIds)}`);
    }

    return success;
}

/**
 * Checks that a resource is no longer among the ones the result lists.
 *
 * @param {ClientResourcesDtoPaginatedResult|AgentResourcesDtoPaginatedResult|null} resources - The result to search.
 * @param {string} resourceRefId - Reference id of the resource that should be gone.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if the resource is absent, false otherwise.
 */
function CheckResourceNotDelegated(resources, resourceRefId, operation) {
    const refIds = ResourceRefIds(resources);

    const success = check(resources, {
        [`CheckResourceNotDelegated - ${operation} no longer lists the resource`]: () =>
            !refIds.includes(resourceRefId),
    });

    if (!success) {
        console.error(`CheckResourceNotDelegated - ${operation} expected ${resourceRefId} to be gone, got: ${JSON.stringify(refIds)}`);
    }

    return success;
}

/**
 * Checks that the resources came back grouped under the role they were delegated through.
 *
 * @param {ClientResourcesDtoPaginatedResult|AgentResourcesDtoPaginatedResult|null} resources - The result to search.
 * @param {string} roleCode - The role code the delegation used.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if the role is present, false otherwise.
 */
function CheckResourcesGrantedViaRole(resources, roleCode, operation) {
    const codes = RoleCodes(resources);

    const success = check(resources, {
        [`CheckResourcesGrantedViaRole - ${operation} groups the access under ${roleCode}`]: () =>
            codes.includes(roleCode),
    });

    if (!success) {
        console.error(`CheckResourcesGrantedViaRole - ${operation} expected role ${roleCode} among: ${JSON.stringify(codes)}`);
    }

    return success;
}

/**
 * Checks that a write call echoed a delegation between the expected parties.
 *
 * The API answers with one entry per delegation it touched. `changed` says
 * whether this call was the one that changed it, so it is reported rather than
 * asserted: delegating something already delegated is a success with no change.
 *
 * @param {Array<ResourceDelegationDto>|null} delegations - What the write call returned, or null when the call failed. Null fails the check rather than throwing, so a failed write is reported the same way a wrong one is.
 * @param {{from: string, to: string}} expected - The party the delegation is from, and the agent it is to.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if a matching delegation came back, false otherwise.
 */
function CheckDelegationEchoed(delegations, expected, operation) {
    const entries = delegations ?? [];

    const success = check(delegations, {
        [`CheckDelegationEchoed - ${operation} echoes a delegation from the client to the agent`]: () =>
            entries.some((delegation) =>
                delegation?.fromId === expected.from && delegation?.toId === expected.to),
    });

    if (!success) {
        console.error(`CheckDelegationEchoed - ${operation} expected: ${JSON.stringify(expected)}`);
        console.error(`CheckDelegationEchoed - ${operation} returned: ${JSON.stringify(delegations)}`);
    } else if (!entries.some((delegation) => delegation?.changed)) {
        console.info(`CheckDelegationEchoed - ${operation} changed nothing, the delegation was already in that state`);
    }

    return success;
}

/**
 * Checks that the party has the expected agent registered.
 *
 * An empty agent list is a valid 200, so the status checks pass whether or not
 * the environment still holds the relationships the fixture was built against.
 * Naming the agent is what turns a reset environment into a red run: without
 * this the run keeps its green checks, just fewer of them, and nothing says the
 * test stopped testing anything.
 *
 * @param {AgentDtoPaginatedResult|null} agents - The agent list to search.
 * @param {string} agentUuid - Party uuid of the agent the fixture expects.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if the agent is registered, false otherwise.
 */
function CheckAgentRegistered(agents, agentUuid, operation) {
    const ids = (agents?.data ?? [])
        .map((entry) => entry?.agent?.id)
        .filter((id) => id !== undefined && id !== null);

    const success = check(agents, {
        [`CheckAgentRegistered - ${operation} lists the expected agent`]: () =>
            ids.includes(agentUuid),
    });

    if (!success) {
        console.error(
            `CheckAgentRegistered - ${operation} expected ${agentUuid} among ${ids.length} agents: ${JSON.stringify(ids)}`,
        );
    }

    return success;
}

/**
 * Checks that the party has the expected client, holding the expected role.
 *
 * Same reasoning as CheckAgentRegistered, and the role is checked alongside the
 * client because the two are what the delegation is built from: a client that is
 * there but no longer grants the role fails the delegation for a reason the
 * fixture cannot see.
 *
 * @param {ClientDtoPaginatedResult|null} clients - The client list to search.
 * @param {string} clientUuid - Party uuid of the client the fixture expects.
 * @param {string} roleCode - Role the delegation is meant to go through.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if the client is listed with that role, false otherwise.
 */
function CheckClientListed(clients, clientUuid, roleCode, operation) {
    const entry = (clients?.data ?? [])
        .find((candidate) => candidate?.client?.id === clientUuid);

    const roles = (entry?.access ?? [])
        .map((access) => access?.role?.code)
        .filter((code) => code !== undefined && code !== null);

    const success = check(clients, {
        [`CheckClientListed - ${operation} lists the expected client with the expected role`]: () =>
            entry !== undefined && roles.includes(roleCode),
    });

    if (!success) {
        console.error(
            entry === undefined
                ? `CheckClientListed - ${operation} expected client ${clientUuid} among: ${JSON.stringify((clients?.data ?? []).map((c) => c?.client?.id))}`
                : `CheckClientListed - ${operation} client ${clientUuid} does not grant ${roleCode}, only: ${JSON.stringify(roles)}`,
        );
    }

    return success;
}

export const ClientDelegationV2DomainChecks = {
    CheckAgentRegistered,
    CheckClientListed,
    CheckDelegationEchoed,
    CheckResourceDelegated,
    CheckResourceNotDelegated,
    CheckResourcesGrantedViaRole,
    ResourceRefIds,
    RoleCodes,
};
