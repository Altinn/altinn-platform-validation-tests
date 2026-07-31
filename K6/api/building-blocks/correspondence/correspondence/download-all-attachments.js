import { check } from "k6";

import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";

/**
 * Downloads all correspondence attachments as a zip archive.
 *
 * @param {CorrespondenceClient} correspondenceClient
 * Client for the Correspondence API.
 * @param {string} correspondenceId
 * Correspondence identifier.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {http.RefinedResponse|null}
 * Response containing the zip archive, or null if the request failed.
 */
export function DownloadAllAttachments(
    correspondenceClient,
    correspondenceId,
    labels = null,
) {
    const res = correspondenceClient.DownloadAllAttachments(
        correspondenceId,
        labels,
    );

    const succeed = check(res, {
        "DownloadAllAttachments - status code is 200": (r) =>
            r.status === 200,
        "DownloadAllAttachments - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);

        return null;
    }

    return res;
}
