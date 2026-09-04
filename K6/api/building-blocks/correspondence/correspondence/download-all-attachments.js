import { check } from "k6";

import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Downloads all correspondence attachments as a zip archive.
 *
 * @param {CorrespondenceClient} correspondenceClient
 * Client for the Correspondence API.
 * @param {string} correspondenceId
 * Correspondence identifier.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {import("k6/http").RefinedResponse<"text">|null}
 * Response containing the zip archive, or null if the request failed.
 */
export function DownloadAllAttachments(
    correspondenceClient,
    correspondenceId,
    labels = null,
) {
    const res = withRetries(
        () => correspondenceClient.DownloadAllAttachments(
            correspondenceId,
            labels,
        ),
        "DownloadAllAttachments",
    );

    const succeed = check(res, {
        "DownloadAllAttachments - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);

        return null;
    }

    return res;
}
