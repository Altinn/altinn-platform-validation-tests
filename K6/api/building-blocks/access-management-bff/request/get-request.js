import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { GetRequestQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets a single access request.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {string} id Request UUID.
 * @param {GetRequestQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetRequestQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The access request. The API does not publish a schema
 * for this response.
 */
export function GetRequest(
    requestClient,
    id,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetRequest(id, queryParams, labels),
        "GetRequest",
    );

    /** @type {object|null} */
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
