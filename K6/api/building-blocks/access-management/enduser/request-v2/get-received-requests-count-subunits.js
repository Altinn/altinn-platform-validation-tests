import { check } from "k6";

import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { ReceivedRequestCountSubunitDto, ReceivedRequestsQuery } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { logFailedRequest } from "../../../common/log-failed-request.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves count of received requests for a party, per subunit.
 *
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {ReceivedRequestsQuery|null} [queryParams]
 * Query parameters. Use {@link ReceivedRequestsV2QueryBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {Array<ReceivedRequestCountSubunitDto>} Count per subunit.
 */
export function GetReceivedRequestsCountSubunits(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetReceivedRequestsCountSubunits(
            queryParams,
            labels,
        ),
        "GetReceivedRequestsCountSubunits",
    );

    /** @type {Array<ReceivedRequestCountSubunitDto>} */
    let counts = [];

    const succeed = check(res, {
        "GetReceivedRequestsCountSubunits - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        logFailedRequest(res, "GetReceivedRequestsCountSubunits");
        return counts;
    }

    check(res, {
        "GetReceivedRequestsCountSubunits - body is valid": (r) => {
            try {
                counts = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return counts;
}
