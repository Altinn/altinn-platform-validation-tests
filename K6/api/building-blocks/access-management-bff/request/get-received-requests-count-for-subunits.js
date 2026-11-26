import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { GetReceivedRequestsCountForSubunitsQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the number of access requests each subunit of a party has received.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {GetReceivedRequestsCountForSubunitsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetReceivedRequestsCountForSubunitsQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The received request counts. The API does not publish
 * a schema for this response.
 */
export function GetReceivedRequestsCountForSubunits(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetReceivedRequestsCountForSubunits(queryParams, labels),
        "GetReceivedRequestsCountForSubunits",
    );

    /** @type {any} */
    let count = null;

    const succeed = check(res, {
        "GetReceivedRequestsCountForSubunits - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return count;
    }

    check(res, {
        "GetReceivedRequestsCountForSubunits - body is valid": (r) => {
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
