import { check } from "k6";

import { AppsInstanceDelegationClient } from "../../../../clients/delegation/index.js";

/**
 * Creates delegation rights for an application instance.
 *
 * @param {AppsInstanceDelegationClient} appsInstanceDelegationClient Client for Apps Instance Delegation API.
 * @param {string} resourceId Resource identifier.
 * @param {string} instanceId Instance identifier.
 * @param {AppsInstanceDelegationRequestDto} request Delegation request.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {AppsInstanceDelegationResponseDto|null} Delegation response.
 */
export function CreateDelegation(
    appsInstanceDelegationClient,
    resourceId,
    instanceId,
    request,
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

    const succeed = check(res, {
        "CreateDelegation - status code is 200 or 206": (r) =>
            r.status === 200 || r.status === 206,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegation;
    }

    check(res, {
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

    return delegation;
}
