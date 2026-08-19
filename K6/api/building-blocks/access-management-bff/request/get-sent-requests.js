import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the access requests a party has sent.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {GetSentRequestsQuery|null} [queryParams] Optional query parameters.
 * Use {@link GetSentRequestsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The sent requests. The API does not publish a schema
 * for this response.
 */
export function GetSentRequests(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetSentRequests(queryParams, labels),
        "GetSentRequests",
    );

    /** @type {object|null} */
    let requests = null;

    const succeed = check(res, {
        "GetSentRequests - status code is 200": (r) =>
            r.status === 200,
        "GetSentRequests - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requests;
    }

    check(res, {
        "GetSentRequests - body is valid": (r) => {
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
