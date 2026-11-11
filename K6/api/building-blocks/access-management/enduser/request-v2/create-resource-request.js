import { check } from "k6";

import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { RequestDto, RequestedRightKeysDto } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { logFailedRequest } from "../../../common/log-failed-request.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a resource request.
 *
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {string} party Party UUID.
 * @param {string} to Party UUID.
 * @param {string} resource Resource identifier.
 * @param {RequestedRightKeysDto|null} [body]
 * The right keys to request.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {RequestDto|null} Created request.
 */
export function CreateResourceRequest(
    requestClient,
    party,
    to,
    resource,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.CreateResourceRequest(
            party,
            to,
            resource,
            body,
            labels,
        ),
        "CreateResourceRequest",
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "CreateResourceRequest - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        logFailedRequest(res, "CreateResourceRequest");
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
