import { check } from "k6";

import {
    AppsInstanceDelegationRequestDto,
    AppsInstanceDelegationResponseDto,
} from "../../../../clients/access-management/altinn-apps/altinn-apps.types.js";
import { AppsInstanceDelegationClient } from "../../../../clients/access-management/altinn-apps/index.js";

/**
 * Creates delegation rights for an application instance.
 *
 * POST /app/delegations/resource/{resourceId}/instance/{instanceId}
 *
 * @param {AppsInstanceDelegationClient} appsInstanceDelegationClient Client for the Apps Instance Delegation API.
 * @param {string} resourceId Resource identifier.
 * @param {string} instanceId Instance identifier.
 * @param {AppsInstanceDelegationRequestDto} request Delegation request.
 * @param {string} [expectedStatus] Expected status for every delegated right,
 * e.g. Delegated or NotDelegated. Only checked when set.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {AppsInstanceDelegationResponseDto|null} Delegation response.
 */
export function CreateDelegation(
    appsInstanceDelegationClient,
    resourceId,
    instanceId,
    request,
    expectedStatus = null,
    labels = null,
) {
    const res = appsInstanceDelegationClient.CreateDelegation(
        resourceId,
        instanceId,
        request,
        labels,
    );

    /** @type {AppsInstanceDelegationResponseDto|null} */
    let delegation = null;

    // 206 is returned when only some of the requested rights were delegated.
    const succeed = check(res, {
        "CreateDelegation - status code is 200 or 206": (r) =>
            r.status === 200 || r.status === 206,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegation;
    }

    const parsed = check(res, {
        "CreateDelegation - body is valid": (r) => {
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

    if (parsed && expectedStatus !== null) {
        check(delegation, {
            [`CreateDelegation - every right is ${expectedStatus}`]: (b) => {
                const rights = b?.rights ?? [];

                return rights.length > 0
                    && rights.every((right) => right.status === expectedStatus);
            },
        });
    }

    return delegation;
}
