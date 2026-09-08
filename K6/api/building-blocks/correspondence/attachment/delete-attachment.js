import { check } from "k6";

import { AttachmentOverviewExt } from "../../../../clients/correspondence/attachment.types.js";
import { AttachmentClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes an attachment.
 *
 * @param {AttachmentClient} attachmentClient Client for the API.
 * @param {string} attachmentId See the client method.
 * @param {{[key:string]:string}|null} labels See the client method.
 * @returns {AttachmentOverviewExt|null} Parsed response body, or null when the call failed.
 */
export function DeleteAttachment(
    attachmentClient,
    attachmentId,
    labels = null,
) {
    const res = withRetries(
        () => attachmentClient.DeleteAttachment(
            attachmentId,
            labels,
        ),
        "DeleteAttachment",
    );

    /** @type {AttachmentOverviewExt|null} */
    let attachment = null;

    const succeed = check(res, {
        "DeleteAttachment - status code is 200": (r) => r.status === 200,
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
