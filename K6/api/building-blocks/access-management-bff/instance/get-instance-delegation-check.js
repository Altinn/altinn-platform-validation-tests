import { check } from "k6";

import { InstanceClient } from "../../../../clients/access-management-bff/instance/index.js";

/**
 * Checks which rights on an instance the authenticated user can delegate.
 *
 * @param {InstanceClient} instanceClient Client for the instance delegation
 * endpoints.
 * @param {GetInstanceDelegationCheckQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetInstanceDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<RightCheck>|null} Delegation check results.
 */
export function GetInstanceDelegationCheck(
    instanceClient,
    queryParams = null,
    labels = null,
) {
    const res = instanceClient.GetInstanceDelegationCheck(queryParams, labels);

    /** @type {Array<RightCheck>|null} */
    let rightChecks = null;

    const succeed = check(res, {
        "GetInstanceDelegationCheck - status code is 200": (r) =>
            r.status === 200,
        "GetInstanceDelegationCheck - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rightChecks;
    }

    check(res, {
        "GetInstanceDelegationCheck - body is valid": (r) => {
            try {
                rightChecks = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return rightChecks;
}
