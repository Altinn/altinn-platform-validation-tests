import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/service-owner/request/index.js";
import { RequestDto, RequestResourceDto } from "../../../../../clients/access-management/service-owner/request/request.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a resource delegation request.
 *
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {RequestResourceDto} request Request payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RequestDto|null} Created request.
 */
export function RequestCreateResourceRequest(
    requestClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.RequestCreateResourceRequest(
            request,
            labels,
        ),
        "RequestCreateResourceRequest",
    );

    /** @type {RequestDto|null} */
    let requestDto = null;

    const succeed = check(res, {
        "RequestCreateResourceRequest - status code is 202": (r) =>
            r.status === 202,
        "RequestCreateResourceRequest - status text is 202 Accepted": (r) =>
            r.status_text === "202 Accepted",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestDto;
    }

    check(res, {
        "RequestCreateResourceRequest - body is valid": (r) => {
            try {
                requestDto = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return requestDto;
}
