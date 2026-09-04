import { check } from "k6";

import { InstanceDelegation } from "../../../../clients/access-management-bff/common/common.types.js";
import { InstanceClient } from "../../../../clients/access-management-bff/instance/index.js";
import { GetInstanceDelegationsQuery } from "../../../../clients/access-management-bff/instance/instance.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the instances delegated between two parties.
 *
 * @param {InstanceClient} instanceClient Client for the instance delegation
 * endpoints.
 * @param {GetInstanceDelegationsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetInstanceDelegationsQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<InstanceDelegation>|null} The instance delegations.
 */
export function GetInstanceDelegations(
    instanceClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => instanceClient.GetInstanceDelegations(queryParams, labels),
        "GetInstanceDelegations",
    );

    /** @type {Array<InstanceDelegation>|null} */
    let instanceDelegations = null;

    const succeed = check(res, {
        "GetInstanceDelegations - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return instanceDelegations;
    }

    check(res, {
        "GetInstanceDelegations - body is valid": (r) => {
            try {
                instanceDelegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instanceDelegations;
}
