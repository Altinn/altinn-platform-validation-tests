import { check } from "k6";

import { SystemUserClientDelegationClient } from "../../../../clients/authentication/index.js";
import { ClientDelegationResponse } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes a client from a system user.
 *
 * @param {SystemUserClientDelegationClient} systemUserClientDelegationClient Client for SystemUserClientDelegation API.
 * @param {string} agent System user id.
 * @param {string} client Client id.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ClientDelegationResponse|null} Delegation response.
 */
export function RemoveClient(
    systemUserClientDelegationClient,
    agent,
    client,
    labels = null,
) {
    const res = withRetries(
        () =>
            systemUserClientDelegationClient.RemoveClient(
                agent,
                client,
                labels,
            ),
        "RemoveClient",
    );

    /** @type {ClientDelegationResponse|null} */
    let delegation = null;

    const succeed = check(res, {
        "RemoveClient - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegation;
    }

    check(res, {
        "RemoveClient - body is valid": (r) => {
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
