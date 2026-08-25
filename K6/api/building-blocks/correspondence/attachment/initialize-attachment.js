import { check } from "k6";

import { InitializeAttachmentExt } from "../../../../clients/correspondence/attachment.types.js";
import { AttachmentClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Initializes a new shared attachment.
 *
 * @param {AttachmentClient} attachmentClient Client for the API.
 * @param {InitializeAttachmentExt} request See the client method.
 * @param {{[key:string]:string}|null} labels See the client method.
 * @returns {string|null} Attachment id.
 */
export function InitializeAttachment(
    attachmentClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => attachmentClient.InitializeAttachment(
            request,
            labels,
        ),
        "InitializeAttachment",
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
