import { check } from "k6";

import { AppsInstanceDelegationClient } from "../../../../clients/apps-instance-delegation/index.js";

/**
 * Revokes delegations for an application instance.
 *
 * @param {AppsInstanceDelegationClient} appsInstanceDelegationClient Client for the Apps Instance Delegation API.
 * @param {string} resourceId Resource identifier.
 * @param {string} instanceId Instance identifier.
 * @param {string} [platformAccessToken] Platform access token.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AppsInstanceRevokeResponseDtoPaginated|null} Revocation result.
 */
export function DeleteDelegations(
    appsInstanceDelegationClient,
    resourceId,
    instanceId,
    platformAccessToken = null,
    labels = null,
) {
    const res = appsInstanceDelegationClient.DeleteDelegations(
        resourceId,
        instanceId,
        platformAccessToken,
        labels,
    );

    /** @type {AppsInstanceRevokeResponseDtoPaginated|null} */
    let result = null;

    const succeed = check(res, {
        "DeleteDelegations - status code is 200": (r) =>
            r.status === 200,
        "DeleteDelegations - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "DeleteDelegations - body is valid": (r) => {
            try {
                result = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return result;
}
