import { check } from "k6";

import { AppsInstanceDelegationClient } from "../../../../clients/delegation/index.js";

/**
 * Checks whether rights can be delegated for an application instance.
 *
 * @param {AppsInstanceDelegationClient} appsInstanceDelegationClient Client for Apps Instance Delegation API.
 * @param {string} resourceId Resource identifier.
 * @param {string} instanceId Instance identifier.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Array<ResourceRightDelegationCheckResultDto>} Delegation check results.
 */
export function CheckResourceDelegation(
    appsInstanceDelegationClient,
    resourceId,
    instanceId,
    labels = null,
) {
    const res = appsInstanceDelegationClient.CheckResourceDelegation(
        resourceId,
        instanceId,
        labels,
    );

    /** @type {Array<ResourceRightDelegationCheckResultDto>} */
    let result = [];

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

    check(res, {
        "CheckResourceDelegation - body is valid": (r) => {
            try {
                const body = JSON.parse(r.body);

                result = body.data ?? [];

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
