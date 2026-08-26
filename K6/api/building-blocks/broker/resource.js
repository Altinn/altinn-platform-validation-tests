import { check } from "k6";

import { ResourceClient } from "../../../clients/broker/index.js";
import { ResourceExt } from "../../../clients/broker/resource.types.js";
import { withRetries } from "../common/retry.js";

/**
 * Gets a broker resource.
 *
 * GET /broker/api/v1/resource/{resourceId}
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} resourceId Altinn resource identifier.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {ResourceExt|null} Parsed response body, or null when the call failed.
 */
export function GetResource(
    resourceClient,
    resourceId,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.GetResource(
            resourceId,
            labels,
        ),
        "GetResource",
    );

    /** @type {ResourceExt|null} */
    let resource = null;

    const succeed = check(res, {
        "GetResource - status code is 200": (r) => r.status === 200,
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

/**
 * Updates a broker resource.
 *
 * PUT /broker/api/v1/resource/{resourceId}
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} resourceId Altinn resource identifier.
 * @param {ResourceExt} request Resource to store.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the call succeeded.
 */
export function PutResource(
    resourceClient,
    resourceId,
    request,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.PutResource(
            resourceId,
            request,
            labels,
        ),
        "PutResource",
    );

    const succeed = check(res, {
        "PutResource - status code is 200": (r) => r.status === 200,
        "PutResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
