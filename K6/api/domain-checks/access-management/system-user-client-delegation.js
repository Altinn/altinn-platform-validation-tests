import { check } from "k6";

/**
 * Checks that a facilitator's client list came back with something in it.
 *
 * A facilitator with no clients is not a delegation failure, it is test data that
 * has gone stale, so this says which organization it was rather than just failing.
 *
 * @param {object|null} customers - The customers response.
 * @param {string} orgNo - Organization number of the facilitator, used in the log.
 * @returns {boolean} True if the response holds at least one client, false otherwise.
 */
function CheckCustomersReturned(customers, orgNo) {
    const clients = Array.isArray(customers) ? customers : [];

    const success = check(customers, {
        "CheckCustomersReturned - Facilitator has clients to delegate": () => clients.length > 0,
    });

    if (!success) {
        console.error(`CheckCustomersReturned - facilitator ${orgNo} returned no clients: ${JSON.stringify(customers)}`);
    }

    return success;
}

/**
 * Checks that one client was delegated to the agent system user.
 *
 * @param {object|null} delegation - The created delegation.
 * @param {string} customerId - The client the delegation was for, used in the log.
 * @returns {boolean} True if a delegation came back, false otherwise.
 */
function CheckClientDelegated(delegation, customerId) {
    const success = check(delegation, {
        "CheckClientDelegated - Delegation was created": (created) =>
            created !== null && created !== undefined,
    });

    if (!success) {
        console.error(`CheckClientDelegated - no delegation came back for client ${customerId}`);
    }

    return success;
}

/**
 * Checks that every client the facilitator has was delegated.
 *
 * Counted rather than inferred from the individual checks, so a run says how far
 * it got instead of only that something failed.
 *
 * @param {number} delegated - How many clients were delegated.
 * @param {number} attempted - How many clients the iteration tried to delegate.
 * @returns {boolean} True if every attempted client was delegated, false otherwise.
 */
function CheckAllClientsDelegated(delegated, attempted) {
    const success = check(null, {
        "CheckAllClientsDelegated - Every client was delegated": () =>
            attempted > 0 && delegated === attempted,
    });

    if (!success) {
        console.error(`CheckAllClientsDelegated - delegated ${delegated} of ${attempted} clients`);
    }

    return success;
}

export const ClientDelegationDomainChecks = {
    CheckAllClientsDelegated,
    CheckClientDelegated,
    CheckCustomersReturned,
};
