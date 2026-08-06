import { check } from "k6";

import { InstanceClient } from "../../../../clients/access-management-bff/instance/index.js";

/**
 * Gets the users an instance can be delegated to.
 *
 * @param {InstanceClient} instanceClient Client for the instance delegation
 * endpoints.
 * @param {GetInstanceSimplifiedUsersQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetInstanceSimplifiedUsersQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<SimplifiedParty>|null} The candidate parties.
 */
export function GetInstanceSimplifiedUsers(
    instanceClient,
    queryParams = null,
    labels = null,
) {
    const res = instanceClient.GetInstanceSimplifiedUsers(queryParams, labels);

    /** @type {Array<SimplifiedParty>|null} */
    let parties = null;

    const succeed = check(res, {
        "GetInstanceSimplifiedUsers - status code is 200": (r) =>
            r.status === 200,
        "GetInstanceSimplifiedUsers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return parties;
    }

    check(res, {
        "GetInstanceSimplifiedUsers - body is valid": (r) => {
            try {
                parties = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return parties;
}
