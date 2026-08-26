import { check } from "k6";

import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Downloads an attachment belonging to a correspondence.
 *
 * @param {CorrespondenceClient} correspondenceClient
 * Client for the Correspondence API.
 * @param {string} correspondenceId
 * Correspondence identifier.
 * @param {string} attachmentId
 * Attachment identifier.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {import("k6/http").RefinedResponse<"text">|null}
 * Response containing the binary attachment, or null if the request failed.
 */
export function DownloadAttachment(
    correspondenceClient,
    correspondenceId,
    attachmentId,
    labels = null,
) {
    const res = withRetries(
        () => correspondenceClient.DownloadAttachment(
            correspondenceId,
            attachmentId,
            labels,
        ),
        "DownloadAttachment",
    );

    const succeed = check(res, {
        "DownloadAttachment - status code is 200": (r) =>
            r.status === 200,
        "DownloadAttachment - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);

        return null;
    }

    return res;
}
