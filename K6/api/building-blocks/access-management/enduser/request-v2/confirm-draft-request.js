import { check } from "k6";

import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { RequestDto } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Confirms a draft request.
 *
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {string} party Party identifier.
 * @param {string} id Request identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {RequestDto|null} Confirmed request.
 */
export function ConfirmDraftRequest(
    requestClient,
    party,
    id,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.ConfirmDraftRequest(
            party,
            id,
            labels,
        ),
        "ConfirmDraftRequest",
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "ConfirmDraftRequest - status code is 200": (r) =>
            r.status === 200,
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
