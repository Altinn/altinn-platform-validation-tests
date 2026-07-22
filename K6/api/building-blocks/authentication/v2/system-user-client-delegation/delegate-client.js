import { check } from "k6";

import { SystemUserClientDelegationClient } from "../../../../clients/systemuserclientdelegation/index.js";

/**
 * Delegates a client to a system user.
 *
 * @param {SystemUserClientDelegationClient} systemUserClientDelegationClient Client for SystemUserClientDelegation API.
 * @param {string} agent System user id.
 * @param {string} client Client id.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ClientDelegationResponse|null} Delegation response.
 */
export function DelegateClient(
    systemUserClientDelegationClient,
    agent,
    client,
    labels = null,
) {
    const res = systemUserClientDelegationClient.DelegateClient(
        agent,
        client,
        labels,
    );

    /** @type {ClientDelegationResponse|null} */
    let delegation = null;

    const succeed = check(res, {
        "DelegateClient - status code is 200": (r) =>
            r.status === 200,
        "DelegateClient - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegation;
    }

    check(res, {
        "DelegateClient - body is valid": (r) => {
            try {
                delegation = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegation;
}
