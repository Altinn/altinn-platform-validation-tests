import { check } from "k6";

import { AppsInstanceDelegationClient } from "../../../../clients/delegation/index.js";

/**
 * Revokes delegation rights for an application instance.
 *
 * @param {AppsInstanceDelegationClient} appsInstanceDelegationClient Client for Apps Instance Delegation API.
 * @param {string} resourceId Resource identifier.
 * @param {string} instanceId Instance identifier.
 * @param {AppsInstanceDelegationRequestDto} request Revoke request.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {AppsInstanceDelegationResponseDto|null} Revoke response.
 */
export function RevokeDelegation(
    appsInstanceDelegationClient,
    resourceId,
    instanceId,
    request,
    labels = null,
) {
    const res = appsInstanceDelegationClient.RevokeDelegation(
        resourceId,
        instanceId,
        request,
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

    check(res, {
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

    return delegation;
}
