import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/access-management/enduser/connections/index.js";

/**
 * Checks access package delegation.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {AccessPackageDelegationCheckQuery|null} [queryParams]
 * Query parameters. Use {@link AccessPackageDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {AccessPackageDtoCheckPaginatedResult|null} Access package delegation check result.
 */
export function GetAccessPackageDelegationCheck(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = connectionsClient.GetAccessPackageDelegationCheck(
        queryParams,
        labels,
    );

    /** @type {AccessPackageDtoCheckPaginatedResult|null} */
    let result = null;

    const succeed = check(res, {
        "GetAccessPackageDelegationCheck - status code is 200": (r) =>
            r.status === 200,
        "GetAccessPackageDelegationCheck - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "GetAccessPackageDelegationCheck - body is valid": (r) => {
            try {
                result = JSON.parse(r.body);

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
