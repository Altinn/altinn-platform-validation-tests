import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";

/**
 * Gets the number of access requests a party has received.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {GetReceivedRequestsCountQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetReceivedRequestsCountQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The received request count. The API does not publish
 * a schema for this response.
 */
export function GetReceivedRequestsCount(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = requestClient.GetReceivedRequestsCount(queryParams, labels);

    /** @type {object|null} */
    let count = null;

    const succeed = check(res, {
        "GetReceivedRequestsCount - status code is 200": (r) =>
            r.status === 200,
        "GetReceivedRequestsCount - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return count;
    }

    check(res, {
        "GetReceivedRequestsCount - body is valid": (r) => {
            try {
                count = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return count;
}
