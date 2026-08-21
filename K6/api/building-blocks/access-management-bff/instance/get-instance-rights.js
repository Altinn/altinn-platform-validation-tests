import { check } from "k6";

import { InstanceRights } from "../../../../clients/access-management-bff/common/common.types.js";
import { InstanceClient } from "../../../../clients/access-management-bff/instance/index.js";
import { GetInstanceRightsQuery } from "../../../../clients/access-management-bff/instance/instance.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the rights a party holds on an instance.
 *
 * @param {InstanceClient} instanceClient Client for the instance delegation
 * endpoints.
 * @param {GetInstanceRightsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetInstanceRightsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {InstanceRights|null} The rights on the instance.
 */
export function GetInstanceRights(
    instanceClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => instanceClient.GetInstanceRights(queryParams, labels),
        "GetInstanceRights",
    );

    /** @type {InstanceRights|null} */
    let instanceRights = null;

    const succeed = check(res, {
        "GetInstanceRights - status code is 200": (r) =>
            r.status === 200,
        "GetInstanceRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return instanceRights;
    }

    check(res, {
        "GetInstanceRights - body is valid": (r) => {
            try {
                instanceRights = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instanceRights;
}
