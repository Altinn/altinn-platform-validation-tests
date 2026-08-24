import { check } from "k6";

import {
    ResourceRightDelegationCheckResultDtoPaginated,
} from "../../../../clients/access-management/altinn-apps/altinn-apps.types.js";
import { AppsInstanceDelegationClient } from "../../../../clients/access-management/altinn-apps/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Checks whether rights can be delegated for an application instance.
 *
 * GET /app/delegationcheck/resource/{resourceId}/instance/{instanceId}
 *
 * @param {AppsInstanceDelegationClient} appsInstanceDelegationClient Client for the Apps Instance Delegation API.
 * @param {string} resourceId Resource identifier.
 * @param {string} instanceId Instance identifier.
 * @param {string|null} [expectedStatus] Expected delegable status for every result,
 * e.g. Delegable or NotDelegable. Only checked when set.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {ResourceRightDelegationCheckResultDtoPaginated|null} Delegation check results.
 */
export function CheckResourceDelegation(
    appsInstanceDelegationClient,
    resourceId,
    instanceId,
    expectedStatus = null,
    labels = null,
) {
    const res = withRetries(
        () => appsInstanceDelegationClient.CheckResourceDelegation(
            resourceId,
            instanceId,
            labels,
        ),
        "CheckResourceDelegation",
    );

    /** @type {ResourceRightDelegationCheckResultDtoPaginated|null} */
    let result = null;

    const succeed = check(res, {
        "CheckResourceDelegation - status code is 200": (r) =>
            r.status === 200,
        "CheckResourceDelegation - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    const parsed = check(res, {
        "CheckResourceDelegation - body is valid": (r) => {
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
            [`CheckResourceDelegation - every result is ${expectedStatus}`]: (b) => {
                const data = b?.data ?? [];

                return data.length > 0
                    && data.every((item) => item.status === expectedStatus);
            },
        });
    }

    return result;
}
