import { check } from "k6";

import { RequestClient } from "../../../../clients/request/index.js";

/**
 * Creates a delegation request.
 *
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {CreateServiceOwnerRequest} request Request payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RequestDto|null} Created request.
 */
export function RequestCreateRequest(
    requestClient,
    request,
    labels = null,
) {
    const res = requestClient.RequestCreateRequest(
        request,
        labels,
    );

    /** @type {RequestDto|null} */
    let requestDto = null;

    const succeed = check(res, {
        "RequestCreateRequest - status code is 202": (r) =>
            r.status === 202,
        "RequestCreateRequest - status text is 202 Accepted": (r) =>
            r.status_text === "202 Accepted",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestDto;
    }

    check(res, {
        "RequestCreateRequest - body is valid": (r) => {
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
