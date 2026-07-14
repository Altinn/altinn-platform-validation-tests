import { check } from "k6";

import { AttachmentClient } from "../../../../clients/correspondence/index.js";

/**
 * Deletes an attachment.
 *
 * @param {AttachmentClient} attachmentClient
 * @param {string} attachmentId
 * @param {{[key:string]:string}|null} labels
 * @returns {AttachmentOverviewExt|null}
 */
export function DeleteAttachment(
    attachmentClient,
    attachmentId,
    labels = null,
) {
    const res = attachmentClient.DeleteAttachment(
        attachmentId,
        labels,
    );

    /** @type {AttachmentOverviewExt|null} */
    let attachment = null;

    const succeed = check(res, {
        "DeleteAttachment - status code is 200": (r) => r.status === 200,
        "DeleteAttachment - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return attachment;
    }

    check(res, {
        "DeleteAttachment - body is valid": (r) => {
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
