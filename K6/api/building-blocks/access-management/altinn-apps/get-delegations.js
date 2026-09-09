import { check } from "k6";

import {
    AppsInstanceDelegationResponseDtoPaginated,
} from "../../../../clients/access-management/altinn-apps/altinn-apps.types.js";
import { AppsInstanceDelegationClient } from "../../../../clients/access-management/altinn-apps/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets delegations for an application instance.
 *
 * GET /app/delegations/resource/{resourceId}/instance/{instanceId}
 *
 * @param {AppsInstanceDelegationClient} appsInstanceDelegationClient Client for the Apps Instance Delegation API.
 * @param {string} resourceId Resource identifier.
 * @param {string} instanceId Instance identifier.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {AppsInstanceDelegationResponseDtoPaginated|null} Delegations response.
 */
export function GetDelegations(
    appsInstanceDelegationClient,
    resourceId,
    instanceId,
    labels = null,
) {
    const res = withRetries(
        () => appsInstanceDelegationClient.GetDelegations(
            resourceId,
            instanceId,
            labels,
        ),
        "GetDelegations",
    );

    /** @type {AppsInstanceDelegationResponseDtoPaginated|null} */
    let delegations = null;

    const succeed = check(res, {
        "GetDelegations - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "GetDelegations - body is valid": (r) => {
            try {
                delegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegations;
}
