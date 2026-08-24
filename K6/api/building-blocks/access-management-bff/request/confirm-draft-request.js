import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { ConfirmDraftRequestQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Confirms a draft access request, turning it into a pending request.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {ConfirmDraftRequestQuery|null} [queryParams] Optional query
 * parameters. Use {@link ConfirmDraftRequestQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the draft request was confirmed.
 */
export function ConfirmDraftRequest(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.ConfirmDraftRequest(queryParams, labels),
        "ConfirmDraftRequest",
    );

    let confirmed = false;

    const succeed = check(res, {
        "ConfirmDraftRequest - status code is 200": (r) =>
            r.status === 200,
        "ConfirmDraftRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return confirmed;
    }

    confirmed = true;

    return confirmed;
}
