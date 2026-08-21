import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { GetSentPackageRequestsQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the access package requests a party has sent.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {GetSentPackageRequestsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetSentPackageRequestsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {any} The sent package requests. The API does not publish a
 * schema for this response.
 */
export function GetSentPackageRequests(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetSentPackageRequests(queryParams, labels),
        "GetSentPackageRequests",
    );

    /** @type {any} */
    let requests = null;

    const succeed = check(res, {
        "GetSentPackageRequests - status code is 200": (r) =>
            r.status === 200,
        "GetSentPackageRequests - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requests;
    }

    check(res, {
        "GetSentPackageRequests - body is valid": (r) => {
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
