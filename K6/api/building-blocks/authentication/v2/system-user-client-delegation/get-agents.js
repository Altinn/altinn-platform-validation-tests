import { check } from "k6";

import { SystemUserClientDelegationClient } from "../../../../clients/systemuserclientdelegation/index.js";

/**
 * Retrieves agent system users associated with the authenticated party.
 *
 * @param {SystemUserClientDelegationClient} systemUserClientDelegationClient Client for SystemUserClientDelegation API.
 * @param {string|null} party Party identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SystemUser[]|null} System users.
 */
export function GetAgents(
    systemUserClientDelegationClient,
    party = null,
    labels = null,
) {
    const res = systemUserClientDelegationClient.GetAgents(
        party,
        labels,
    );

    /** @type {SystemUser[]|null} */
    let systemUsers = null;

    const succeed = check(res, {
        "GetAgents - status code is 200": (r) =>
            r.status === 200,
        "GetAgents - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systemUsers;
    }

    check(res, {
        "GetAgents - body is valid": (r) => {
            try {
                systemUsers = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return systemUsers;
}