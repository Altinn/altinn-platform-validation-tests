import { check } from "k6";

import { SystemUserClientDelegationClient } from "../../../../clients/systemuserclientdelegation/index.js";

/**
 * Gets clients who can delegate to the system user.
 *
 * @param {SystemUserClientDelegationClient} systemUserClientDelegationClient Client for SystemUserClientDelegation API.
 * @param {string|null} agent System user id.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ClientInfoClientInfoPaginated|null} Available clients.
 */
export function GetAvailableClients(
    systemUserClientDelegationClient,
    agent = null,
    labels = null,
) {
    const res = systemUserClientDelegationClient.GetAvailableClients(
        agent,
        labels,
    );

    /** @type {ClientInfoClientInfoPaginated|null} */
    let clients = null;

    const succeed = check(res, {
        "GetAvailableClients - status code is 200": (r) =>
            r.status === 200,
        "GetAvailableClients - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return clients;
    }

    check(res, {
        "GetAvailableClients - body is valid": (r) => {
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
