import { check } from "k6";

import { SystemUserClientDelegationClient } from "../../../../clients/authentication/index.js";
import { ClientInfoClientInfoPaginated } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets clients delegated to the specified system user.
 *
 * @param {SystemUserClientDelegationClient} systemUserClientDelegationClient Client for SystemUserClientDelegation API.
 * @param {string|null} agent System user id.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ClientInfoClientInfoPaginated|null} Delegated clients.
 */
export function GetClients(
    systemUserClientDelegationClient,
    agent = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserClientDelegationClient.GetClients(agent, labels),
        "GetClients",
    );

    /** @type {ClientInfoClientInfoPaginated|null} */
    let clients = null;

    const succeed = check(res, {
        "GetClients - status code is 200": (r) =>
            r.status === 200,
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
