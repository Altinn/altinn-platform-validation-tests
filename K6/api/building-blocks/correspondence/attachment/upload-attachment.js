import { check } from "k6";

import { AttachmentClient } from "../../../../clients/correspondence/index.js";

/**
 * Uploads attachment data.
 *
 * @param {AttachmentClient} attachmentClient
 * @param {string} attachmentId
 * @param {*} file
 * @param {{[key:string]:string}|null} labels
 * @returns {AttachmentOverviewExt|null}
 */
export function UploadAttachment(
    attachmentClient,
    attachmentId,
    file,
    labels = null,
) {
    const res = attachmentClient.UploadAttachment(
        attachmentId,
        file,
        labels,
    );

    /** @type {AttachmentOverviewExt|null} */
    let attachment = null;

    const succeed = check(res, {
        "UploadAttachment - status code is 200": (r) => r.status === 200,
        "UploadAttachment - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return attachment;
    }

    check(res, {
        "UploadAttachment - body is valid": (r) => {
            try {
                attachment = JSON.parse(r.body);
                return true;
            } catch {
                console.log("Unable to parse response body");
                console.log(r.body);
                return false;
            }
        },
    });

    return attachment;
}
