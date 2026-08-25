import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";
import { RequestDto } from "../../../../../clients/access-management/service-owner/request/request.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets a request by id.
 *
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {string} party Party identifier.
 * @param {string} id Request identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RequestDto|null} Request.
 */
export function GetRequest(
    requestClient,
    party,
    id,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetRequest(
            party,
            id,
            labels,
        ),
        "GetRequest",
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "GetRequest - status code is 200": (r) =>
            r.status === 200,
        "GetRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return request;
    }

    check(res, {
        "GetRequest - body is valid": (r) => {
            try {
                request = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return request;
}
