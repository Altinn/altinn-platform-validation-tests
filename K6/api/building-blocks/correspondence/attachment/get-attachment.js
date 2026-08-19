import { check } from "k6";

import { AttachmentClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets attachment overview.
 *
 * @param {AttachmentClient} attachmentClient Client for the API.
 * @param {string} attachmentId See the client method.
 * @param {{[key:string]:string}|null} labels See the client method.
 * @returns {AttachmentOverviewExt|null} Parsed response body, or null when the call failed.
 */
export function GetAttachment(
    attachmentClient,
    attachmentId,
    labels = null,
) {
    const res = withRetries(
        () => attachmentClient.GetAttachment(
            attachmentId,
            labels,
        ),
        "GetAttachment",
    );

    /** @type {AttachmentOverviewExt|null} */
    let attachment = null;

    const succeed = check(res, {
        "GetAttachment - status code is 200": (r) => r.status === 200,
        "GetAttachment - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return attachment;
    }

    check(res, {
        "GetAttachment - body is valid": (r) => {
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
