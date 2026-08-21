import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { GetReceivedPackageRequestsQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the access package requests a party has received.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {GetReceivedPackageRequestsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetReceivedPackageRequestsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {any} The received package requests. The API does not
 * publish a schema for this response.
 */
export function GetReceivedPackageRequests(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetReceivedPackageRequests(queryParams, labels),
        "GetReceivedPackageRequests",
    );

    /** @type {any} */
    let requests = null;

    const succeed = check(res, {
        "GetReceivedPackageRequests - status code is 200": (r) =>
            r.status === 200,
        "GetReceivedPackageRequests - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requests;
    }

    check(res, {
        "GetReceivedPackageRequests - body is valid": (r) => {
            try {
                requests = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return requests;
}
