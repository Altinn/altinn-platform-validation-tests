import { check } from "k6";

import { AttachmentClient } from "../../../../clients/correspondence/index.js";

/**
 * Downloads attachment data.
 *
 * @param {AttachmentClient} attachmentClient
 * @param {string} attachmentId
 * @param {{[key:string]:string}|null} labels
 * @returns {ArrayBuffer|null}
 */
export function DownloadAttachment(
    attachmentClient,
    attachmentId,
    labels = null,
) {
    const res = attachmentClient.DownloadAttachment(
        attachmentId,
        labels,
    );

    /** @type {ArrayBuffer|null} */
    let body = null;

    const succeed = check(res, {
        "DownloadAttachment - status code is 200": (r) => r.status === 200,
        "DownloadAttachment - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return body;
    }

    check(res, {
        "DownloadAttachment - body is valid": (r) => {
            body = r.body;
            return body !== null;
        },
    });

    return body;
}
