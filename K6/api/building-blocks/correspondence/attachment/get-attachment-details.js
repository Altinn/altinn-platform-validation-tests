import { check } from "k6";

import { AttachmentDetailsExt } from "../../../../clients/correspondence/attachment.types.js";
import { AttachmentClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets attachment details.
 *
 * @param {AttachmentClient} attachmentClient Client for the API.
 * @param {string} attachmentId See the client method.
 * @param {{[key:string]:string}|null} labels See the client method.
 * @returns {AttachmentDetailsExt|null} Parsed response body, or null when the call failed.
 */
export function GetAttachmentDetails(
    attachmentClient,
    attachmentId,
    labels = null,
) {
    const res = withRetries(
        () => attachmentClient.GetAttachmentDetails(
            attachmentId,
            labels,
        ),
        "GetAttachmentDetails",
    );

    /** @type {AttachmentDetailsExt|null} */
    let attachment = null;

    const succeed = check(res, {
        "GetAttachmentDetails - status code is 200": (r) => r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return attachment;
    }

    check(res, {
        "GetAttachmentDetails - body is valid": (r) => {
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
