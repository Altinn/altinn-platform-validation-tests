import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";

/**
 * Gets a draft access request.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {string} id Request UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The draft access request. The API does not publish a
 * schema for this response.
 */
export function GetDraftRequest(requestClient, id, labels = null) {
    const res = requestClient.GetDraftRequest(id, labels);

    /** @type {object|null} */
    let request = null;

    const succeed = check(res, {
        "GetDraftRequest - status code is 200": (r) =>
            r.status === 200,
        "GetDraftRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return request;
    }

    check(res, {
        "GetDraftRequest - body is valid": (r) => {
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
