import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";
import { RequestDto } from "../../../../../clients/access-management/service-owner/request/request.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Withdraws a sent request.
 *
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {string} party Party identifier.
 * @param {string} id Request identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {RequestDto|null} Withdrawn request.
 */
export function WithdrawSentRequest(
    requestClient,
    party,
    id,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.WithdrawSentRequest(
            party,
            id,
            labels,
        ),
        "WithdrawSentRequest",
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "WithdrawSentRequest - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return request;
    }

    check(res, {
        "WithdrawSentRequest - body is valid": (r) => {
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
