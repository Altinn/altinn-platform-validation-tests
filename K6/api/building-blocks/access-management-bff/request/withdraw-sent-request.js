import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management-bff/request/index.js";

/**
 * Withdraws an access request a party has sent.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {WithdrawSentRequestQuery|null} [queryParams] Optional query
 * parameters. Use {@link WithdrawSentRequestQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the request was withdrawn.
 */
export function WithdrawSentRequest(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = requestClient.WithdrawSentRequest(queryParams, labels);

    let withdrawn = false;

    const succeed = check(res, {
        "WithdrawSentRequest - status code is 200": (r) =>
            r.status === 200,
        "WithdrawSentRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return withdrawn;
    }

    withdrawn = true;

    return withdrawn;
}
