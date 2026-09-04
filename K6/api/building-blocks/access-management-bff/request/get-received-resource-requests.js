import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { GetReceivedResourceRequestsQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the resource access requests a party has received.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {GetReceivedResourceRequestsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetReceivedResourceRequestsQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The received resource requests. The API does not
 * publish a schema for this response.
 */
export function GetReceivedResourceRequests(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetReceivedResourceRequests(queryParams, labels),
        "GetReceivedResourceRequests",
    );

    /** @type {any} */
    let requests = null;

    const succeed = check(res, {
        "GetReceivedResourceRequests - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requests;
    }

    check(res, {
        "GetReceivedResourceRequests - body is valid": (r) => {
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
