import { check } from "k6";

import { SystemUserClientDelegationClient } from "../../../../clients/systemuserclientdelegation/index.js";

/**
 * Removes a client from a system user.
 *
 * @param {SystemUserClientDelegationClient} systemUserClientDelegationClient Client for SystemUserClientDelegation API.
 * @param {string} agent System user id.
 * @param {string} client Client id.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {DelegationResponse[]|null} Delegations.
 */
export function RemoveClient(
    systemUserClientDelegationClient,
    agent,
    client,
    labels = null,
) {
    const res = systemUserClientDelegationClient.RemoveClient(
        agent,
        client,
        labels,
    );

    /** @type {DelegationResponse[]|null} */
    let delegations = null;

    const succeed = check(res, {
        "RemoveClient - status code is 200": (r) =>
            r.status === 200,
        "RemoveClient - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "RemoveClient - body is valid": (r) => {
            try {
                delegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegations;
}
