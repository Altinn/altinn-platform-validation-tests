import { check } from "k6";

import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the message body of a correspondence using a client configured with
 * the matching Dialogporten dialog token.
 *
 * @param {CorrespondenceClient} correspondenceClient Client for the Correspondence API.
 * @param {string} correspondenceId Correspondence UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {string|null} Message body or null when request fails.
 */
export function GetCorrespondenceContent(
    correspondenceClient,
    correspondenceId,
    labels = null,
) {
    const res = withRetries(
        () => correspondenceClient.GetCorrespondenceContent(
            correspondenceId,
            labels,
        ),
        "GetCorrespondenceContent",
    );

    const succeed = check(res, {
        "GetCorrespondenceContent - status code is 200": (r) =>
            r.status === 200,

    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return null;
    }

    return res.body;
}
