import { check } from "k6";

import { AttachmentClient } from "../../../../clients/correspondence/index.js";

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
    const res = attachmentClient.GetAttachmentDetails(
        attachmentId,
        labels,
    );

    /** @type {AttachmentDetailsExt|null} */
    let attachment = null;

    const succeed = check(res, {
        "GetAttachmentDetails - status code is 200": (r) => r.status === 200,
        "GetAttachmentDetails - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
