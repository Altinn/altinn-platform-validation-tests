import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { GetSentResourceRequestsQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the resource access requests a party has sent.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {GetSentResourceRequestsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetSentResourceRequestsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The sent resource requests. The API does not publish
 * a schema for this response.
 */
export function GetSentResourceRequests(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetSentResourceRequests(queryParams, labels),
        "GetSentResourceRequests",
    );

    /** @type {object|null} */
    let requests = null;

    const succeed = check(res, {
        "GetSentResourceRequests - status code is 200": (r) =>
            r.status === 200,
        "GetSentResourceRequests - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requests;
    }

    check(res, {
        "GetSentResourceRequests - body is valid": (r) => {
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
