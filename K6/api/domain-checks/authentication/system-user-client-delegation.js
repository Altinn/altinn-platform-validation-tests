import { check } from "k6";

import { ClientInfo, ClientInfoClientInfoPaginated, SystemUser } from "../../../clients/authentication/types.js";

/**
 * Pulls the client list out of a paginated client response.
 *
 * The endpoints answer with a paginated object rather than a bare list, so every
 * check below reads through this instead of repeating the same guard.
 *
 * @param {ClientInfoClientInfoPaginated|null} clients - The paginated client response.
 * @returns {ClientInfo[]} The clients, or an empty list when the response was missing or shaped differently.
 */
function clientList(clients) {
    return Array.isArray(clients?.data) ? clients.data : [];
}

/**
 * Checks that the facilitator's agent system users include the arranged one.
 *
 * @param {SystemUser[]|null} agents - The agent system users the endpoint returned.
 * @param {string} systemUserId - Id of the agent system user the arrange created.
 * @returns {boolean} True if the agent system user is listed, false otherwise.
 */
function CheckAgentSystemUserListed(agents, systemUserId) {
    const listed = Array.isArray(agents) ? agents : [];

    const success = check(agents, {
        "CheckAgentSystemUserListed - The agent system user is listed for the facilitator": () =>
            listed.some((agent) => agent?.id === systemUserId),
    });

    if (!success) {
        console.error(`CheckAgentSystemUserListed - expected agent system user ${systemUserId}, got: ${JSON.stringify(agents)}`);
    }

    return success;
}

/**
 * Checks that the facilitator has clients that can be delegated.
 *
 * A facilitator without clients is not a delegation failure, it is test data that
 * has gone stale, so this names the organisation rather than only failing.
 *
 * @param {ClientInfoClientInfoPaginated|null} clients - The available clients.
 * @param {string} orgNo - Organisation number of the facilitator, used in the log.
 * @returns {boolean} True if at least one client came back, false otherwise.
 */
function CheckAvailableClients(clients, orgNo) {
    const available = clientList(clients);

    const success = check(clients, {
        "CheckAvailableClients - The facilitator has clients to delegate": () => available.length > 0,
    });

    if (!success) {
        console.error(`CheckAvailableClients - facilitator ${orgNo} has no clients to delegate: ${JSON.stringify(clients)}`);
    }

    return success;
}

/**
 * Checks that a delegation echoes the agent system user and the client it was for.
 *
 * Both the delegate and the remove endpoint answer with the same pair, so this
 * covers either. The operation name goes into the check, so a test that does both
 * says which one failed.
 *
 * @param {{agent: string, client: string}|null} delegation - The delegation response.
 * @param {{agent: string, client: string}} expected - The agent system user and client the call was made for.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the response echoes the pair, false otherwise.
 */
function CheckDelegationEchoesClient(delegation, expected, operation) {
    const success = check(delegation, {
        [`CheckDelegationEchoesClient - ${operation} echoes the agent system user and the client`]: (response) =>
            response !== null &&
            response !== undefined &&
            response.agent === expected.agent &&
            response.client === expected.client,
    });

    if (!success) {
        console.error(`CheckDelegationEchoesClient - ${operation} expected: ${JSON.stringify(expected)}`);
        console.error(`CheckDelegationEchoesClient - ${operation} returned: ${JSON.stringify(delegation)}`);
    }

    return success;
}

/**
 * Checks that a client is delegated to the agent system user.
 *
 * @param {ClientInfoClientInfoPaginated|null} clients - The clients delegated to the system user.
 * @param {string} clientId - The client that was delegated.
 * @returns {boolean} True if the client is on the system user, false otherwise.
 */
function CheckClientDelegated(clients, clientId) {
    const delegated = clientList(clients);

    const success = check(clients, {
        "CheckClientDelegated - The client is delegated to the agent system user": () =>
            delegated.some((client) => client?.clientId === clientId),
    });

    if (!success) {
        console.error(`CheckClientDelegated - expected client ${clientId} among the delegated clients: ${JSON.stringify(clients)}`);
    }

    return success;
}

/**
 * Checks that a client is no longer delegated to the agent system user.
 *
 * @param {ClientInfoClientInfoPaginated|null} clients - The clients delegated to the system user.
 * @param {string} clientId - The client that was removed.
 * @returns {boolean} True if the client is gone, false otherwise.
 */
function CheckClientNotDelegated(clients, clientId) {
    const delegated = clientList(clients);

    const success = check(clients, {
        "CheckClientNotDelegated - The removed client is no longer delegated": () =>
            !delegated.some((client) => client?.clientId === clientId),
    });

    if (!success) {
        console.error(`CheckClientNotDelegated - client ${clientId} is still delegated: ${JSON.stringify(clients)}`);
    }

    return success;
}

/**
 * Checks that the setup produced an agent system user to delegate to.
 *
 * The arrange stops at the step that broke rather than failing the run, so this is
 * where an arrange that got nowhere surfaces. A caller that gets false back should
 * fail(): there is nothing to say about the delegation endpoints without an agent
 * system user, and failing here lets the teardown remove what the arrange did
 * manage to create.
 *
 * @param {string|undefined} systemUserId - The agent system user the setup should have produced.
 * @returns {boolean} True if there is an agent system user to act on, false otherwise.
 */
function CheckAgentSystemUserArranged(systemUserId) {
    const success = check(systemUserId, {
        "CheckAgentSystemUserArranged - The setup produced an agent system user": (id) =>
            id !== null && id !== undefined,
    });

    if (!success) {
        console.error(`CheckAgentSystemUserArranged - expected an agent system user from the setup, got ${JSON.stringify(systemUserId)}`);
    }

    return success;
}

export const SystemUserClientDelegationDomainChecks = {
    CheckAgentSystemUserArranged,
    CheckAgentSystemUserListed,
    CheckAvailableClients,
    CheckClientDelegated,
    CheckClientNotDelegated,
    CheckDelegationEchoesClient,
};
