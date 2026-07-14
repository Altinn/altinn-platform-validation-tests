import { check } from "k6";

import { AttachmentClient } from "../../../../clients/correspondence/index.js";

/**
 * Initializes a new shared attachment.
 *
 * @param {AttachmentClient} attachmentClient
 * @param {InitializeAttachmentExt} request
 * @param {{[key:string]:string}|null} labels
 * @returns {string|null} Attachment id.
 */
export function InitializeAttachment(
    attachmentClient,
    request,
    labels = null,
) {
    const res = attachmentClient.InitializeAttachment(
        request,
        labels,
    );

    /** @type {string|null} */
    let attachmentId = null;

    const succeed = check(res, {
        "InitializeAttachment - status code is 200": (r) => r.status === 200,
        "InitializeAttachment - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return attachmentId;
    }

    check(res, {
        "InitializeAttachment - body is valid": (r) => {
            try {
                attachmentId = JSON.parse(r.body);
                return true;
            } catch {
                console.log("Unable to parse response body");
                console.log(r.body);
                return false;
            }
        },
    });

    return attachmentId;
}
