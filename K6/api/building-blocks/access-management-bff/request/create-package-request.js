import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { CreatePackageRequestQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Creates an access request for an access package.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {CreatePackageRequestQuery|null} [queryParams] Optional query
 * parameters. Use {@link CreatePackageRequestQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The created request. The API does not publish a
 * schema for this response.
 */
export function CreatePackageRequest(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.CreatePackageRequest(queryParams, labels),
        "CreatePackageRequest",
    );

    /** @type {any} */
    let request = null;

    const succeed = check(res, {
        "CreatePackageRequest - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return request;
    }

    check(res, {
        "CreatePackageRequest - body is valid": (r) => {
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
