import { check } from "k6";

import { SystemUserClientDelegationClient } from "../../../../clients/systemuserclientdelegation/index.js";

/**
 * Gets clients delegated to the specified system user.
 *
 * @param {SystemUserClientDelegationClient} systemUserClientDelegationClient Client for SystemUserClientDelegation API.
 * @param {string|null} agent System user id.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ClientInfoClientInfoPaginated|null} Delegated clients.
 */
export function GetClients(
    systemUserClientDelegationClient,
    agent = null,
    labels = null,
) {
    const res = systemUserClientDelegationClient.GetClients(
        agent,
        labels,
    );

    /** @type {ClientInfoClientInfoPaginated|null} */
    let clients = null;

    const succeed = check(res, {
        "GetClients - status code is 200": (r) =>
            r.status === 200,
        "GetClients - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return clients;
    }

    check(res, {
        "GetClients - body is valid": (r) => {
            try {
                clients = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return clients;
}
