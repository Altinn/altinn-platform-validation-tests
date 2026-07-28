import { check } from "k6";

import {
    AppsInstanceDelegationRequestDto,
    AppsInstanceDelegationResponseDto,
} from "../../../../clients/access-management/altinn-apps/altinn-apps.types.js";
import { AppsInstanceDelegationClient } from "../../../../clients/access-management/altinn-apps/index.js";

/**
 * Revokes delegation rights for an application instance.
 *
 * POST /app/delegationrevoke/resource/{resourceId}/instance/{instanceId}
 *
 * The API responds with AppsInstanceDelegationResponseDto here, not the Revoke
 * variant, so the rights carry a delegation status and not a revoke status.
 *
 * @param {AppsInstanceDelegationClient} appsInstanceDelegationClient Client for the Apps Instance Delegation API.
 * @param {string} resourceId Resource identifier.
 * @param {string} instanceId Instance identifier.
 * @param {AppsInstanceDelegationRequestDto} request Revoke request.
 * @param {string} [expectedStatus] Expected status for every right in the
 * response, e.g. Delegated or NotDelegated. Only checked when set.
 * @param {string} [platformAccessToken] Platform access token.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {AppsInstanceDelegationResponseDto|null} Revoke response.
 */
export function RevokeDelegation(
    appsInstanceDelegationClient,
    resourceId,
    instanceId,
    request,
    expectedStatus = null,
    platformAccessToken = null,
    labels = null,
) {
    const res = appsInstanceDelegationClient.RevokeDelegation(
        resourceId,
        instanceId,
        request,
        platformAccessToken,
        labels,
    );

    /** @type {AppsInstanceDelegationResponseDto|null} */
    let delegation = null;

    const succeed = check(res, {
        "RevokeDelegation - status code is 200": (r) =>
            r.status === 200,
        "RevokeDelegation - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegation;
    }

    const parsed = check(res, {
        "RevokeDelegation - body is valid": (r) => {
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
            [`RevokeDelegation - every right is ${expectedStatus}`]: (b) => {
                const rights = b?.rights ?? [];

                return rights.length > 0
                    && rights.every((right) => right.status === expectedStatus);
            },
        });
    }

    return delegation;
}
