import { check } from "k6";

import {
    AppsInstanceRevokeResponseDtoPaginated,
} from "../../../../clients/access-management/altinn-apps/altinn-apps.types.js";
import { AppsInstanceDelegationClient } from "../../../../clients/access-management/altinn-apps/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Revokes all delegations for an application instance.
 *
 * DELETE /app/delegationrevoke/resource/{resourceId}/instance/{instanceId}
 *
 * @param {AppsInstanceDelegationClient} appsInstanceDelegationClient Client for the Apps Instance Delegation API.
 * @param {string} resourceId Resource identifier.
 * @param {string} instanceId Instance identifier.
 * @param {string|null} [expectedStatus] Expected revoke status for every right,
 * e.g. Revoked or NotRevoked. Only checked when set.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AppsInstanceRevokeResponseDtoPaginated|null} Revocation result.
 */
export function DeleteDelegations(
    appsInstanceDelegationClient,
    resourceId,
    instanceId,
    expectedStatus = null,
    labels = null,
) {
    const res = withRetries(
        () => appsInstanceDelegationClient.DeleteDelegations(
            resourceId,
            instanceId,
            labels,
        ),
        "DeleteDelegations",
    );

    /** @type {AppsInstanceRevokeResponseDtoPaginated|null} */
    let result = null;

    const succeed = check(res, {
        "DeleteDelegations - status code is 200": (r) =>
            r.status === 200,
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
        const asExpected = check(result, {
            "DeleteDelegations - every right has the expected status": (/** @type {AppsInstanceRevokeResponseDtoPaginated|null} */ b) => {
                const rights = (b?.data ?? []).flatMap(
                    (delegation) => delegation.rights ?? [],
                );

                return rights.length > 0
                    && rights.every((right) => right.status === expectedStatus);
            },
        });

        if (!asExpected) {
            // result is filled in from inside a check callback, which the compiler
            // cannot follow, so the type is restated here.
            const deleted = /** @type {AppsInstanceRevokeResponseDtoPaginated|null} */ (result);
            const statuses = (deleted?.data ?? []).flatMap((delegation) => (delegation.rights ?? []).map((right) => right.status));
            console.error(`DeleteDelegations - expected every right to be ${expectedStatus}, got: ${JSON.stringify(statuses)}`);
        }
    }

    return result;
}
