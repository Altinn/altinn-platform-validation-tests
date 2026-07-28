import { check } from "k6";

import { AppsInstanceDelegationClient } from "../../../../clients/access-management/altinn-apps/index.js";
import {
    AppsInstanceRevokeResponseDtoPaginated,
} from "../../../../clients/access-management/altinn-apps/types.js";

/**
 * Revokes all delegations for an application instance.
 *
 * DELETE /app/delegationrevoke/resource/{resourceId}/instance/{instanceId}
 *
 * @param {AppsInstanceDelegationClient} appsInstanceDelegationClient Client for the Apps Instance Delegation API.
 * @param {string} resourceId Resource identifier.
 * @param {string} instanceId Instance identifier.
 * @param {string} [expectedStatus] Expected revoke status for every right,
 * e.g. Revoked or NotRevoked. Only checked when set.
 * @param {string} [platformAccessToken] Platform access token.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AppsInstanceRevokeResponseDtoPaginated|null} Revocation result.
 */
export function DeleteDelegations(
    appsInstanceDelegationClient,
    resourceId,
    instanceId,
    expectedStatus = null,
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

    const parsed = check(res, {
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

    if (parsed && expectedStatus !== null) {
        check(result, {
            [`DeleteDelegations - every right is ${expectedStatus}`]: (b) => {
                const rights = (b?.data ?? []).flatMap(
                    (delegation) => delegation.rights ?? [],
                );

                return rights.length > 0
                    && rights.every((right) => right.status === expectedStatus);
            },
        });
    }

    return result;
}
