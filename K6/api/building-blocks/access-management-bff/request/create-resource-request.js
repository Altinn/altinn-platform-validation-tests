import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { CreateResourceRequestQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Creates an access request for a resource.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {CreateResourceRequestQuery|null} [queryParams] Optional query
 * parameters. Use {@link CreateResourceRequestQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The created request. The API does not publish a
 * schema for this response.
 */
export function CreateResourceRequest(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.CreateResourceRequest(queryParams, labels),
        "CreateResourceRequest",
    );

    /** @type {any} */
    let request = null;

    const succeed = check(res, {
        "CreateResourceRequest - status code is 200": (r) =>
            r.status === 200,
        "CreateResourceRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return request;
    }

    check(res, {
        "CreateResourceRequest - body is valid": (r) => {
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
