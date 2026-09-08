import { check } from "k6";

import { InitializeCorrespondencesResponseExt } from "../../../clients/correspondence/correspondence.types.js";

/**
 * Checks attachment ids returned by a correspondence upload operation.
 *
 * @param {InitializeCorrespondencesResponseExt|null} response API response.
 * @param {number} expectedCount Number of uploaded attachments.
 * @returns {boolean} True if the expected attachment ids were returned.
 */
function CheckAttachmentIds(response, expectedCount) {
    const attachmentIds = Array.isArray(response?.attachmentIds)
        ? response.attachmentIds
        : [];

    const success = check(response, {
        "CheckAttachmentIds - Expected number of attachment ids is returned":
            () => attachmentIds.length === expectedCount,
        "CheckAttachmentIds - Every attachment has an id": () =>
            attachmentIds.every(
                (attachmentId) =>
                    typeof attachmentId === "string" &&
                    attachmentId.length > 0,
            ),
    });

    if (!success) {
        console.error(
            `CheckAttachmentIds - expected ${expectedCount} attachment id(s), got: ${JSON.stringify(attachmentIds)}`,
        );
    }

    return success;
}

export const AttachmentDomainChecks = {
    CheckAttachmentIds,
};
