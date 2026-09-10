import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { GetReceivedRequestsCountQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the number of access requests a party has received.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {GetReceivedRequestsCountQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetReceivedRequestsCountQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The received request count. The API does not publish
 * a schema for this response.
 */
export function GetReceivedRequestsCount(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetReceivedRequestsCount(queryParams, labels),
        "GetReceivedRequestsCount",
    );

    /** @type {any} */
    let count = null;

    const succeed = check(res, {
        "GetReceivedRequestsCount - status code is 200": (r) =>
            r.status === 200,
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
