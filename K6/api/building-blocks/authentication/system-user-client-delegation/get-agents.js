import { check } from "k6";

import { SystemUserClientDelegationClient } from "../../../../clients/authentication/index.js";
import { SystemUser } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves agent system users associated with the authenticated party.
 *
 * @param {SystemUserClientDelegationClient} systemUserClientDelegationClient Client for SystemUserClientDelegation API.
 * @param {string|null} party Party identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {SystemUser[]|null} System users.
 */
export function GetAgents(
    systemUserClientDelegationClient,
    party = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserClientDelegationClient.GetAgents(party, labels),
        "GetAgents",
    );

    /** @type {SystemUser[]|null} */
    let systemUsers = null;

    const succeed = check(res, {
        "GetAgents - status code is 200": (r) =>
            r.status === 200,
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
