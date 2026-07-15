import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management/enduser/request/index.js";

/**
 * Confirms a draft request.
 *
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {string} party Party identifier.
 * @param {string} id Request identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RequestDto|null} Confirmed request.
 */
export function ConfirmDraftRequest(
    requestClient,
    party,
    id,
    labels = null,
) {
    const res = requestClient.ConfirmDraftRequest(
        party,
        id,
        labels,
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "ConfirmDraftRequest - status code is 200": (r) =>
            r.status === 200,
        "ConfirmDraftRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return request;
    }

    check(res, {
        "ConfirmDraftRequest - body is valid": (r) => {
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
