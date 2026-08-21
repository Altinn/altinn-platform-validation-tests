import { check } from "k6";

import { ServiceResourceFE } from "../../../../clients/access-management-bff/common/common.types.js";
import { ResourceClient } from "../../../../clients/access-management-bff/resource/index.js";
import { GetResourceQuery } from "../../../../clients/access-management-bff/resource/resource.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets a single resource.
 *
 * @param {ResourceClient} resourceClient Client for the resource endpoints.
 * @param {GetResourceQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetResourceQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ServiceResourceFE|null} The resource.
 */
export function GetResource(
    resourceClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.GetResource(queryParams, labels),
        "GetResource",
    );

    /** @type {ServiceResourceFE|null} */
    let resource = null;

    const succeed = check(res, {
        "GetResource - status code is 200": (r) =>
            r.status === 200,
        "GetResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resource;
    }

    check(res, {
        "GetResource - body is valid": (r) => {
            try {
                resource = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resource;
}
