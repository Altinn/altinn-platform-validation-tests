import { check, group } from "k6";

import { handleSummary } from "../../../common-imports.js";
import { UploadCorrespondences } from "../../building-blocks/correspondence/correspondence/index.js";
import {
    buildUploadCorrespondenceForm,
    getCorrespondenceOptions,
    getEndUser,
    getEnterpriseSenderClient,
    getExpectedRecipient,
    setupCorrespondenceTestData,
} from "./commons.js";

const uploadLabel = { step: "Initialize and upload correspondence" };

export const options = getCorrespondenceOptions([uploadLabel]);

export function setup() {
    return setupCorrespondenceTestData();
}

/**
 * Test: initialize a correspondence with a 50 KiB attachment using a service
 * owner enterprise token.
 *
 * @param {Array<{ssn: string}>} endUsers Shared end-user test data.
 */
export default function (endUsers) {
    const recipient = getEndUser(endUsers).ssn;
    const expectedRecipient = getExpectedRecipient(recipient);
    const correspondenceClient = getEnterpriseSenderClient();
    const formData = buildUploadCorrespondenceForm(recipient);

    group(
        "A service owner can initialize a correspondence with an attachment",
        function () {
            const uploadResponse = UploadCorrespondences(
                correspondenceClient,
                formData,
                uploadLabel,
            );

            if (uploadResponse === null) {
                return;
            }

            check(uploadResponse, {
                "Upload correspondence - one correspondence is returned":
                    (response) => response.correspondences?.length === 1,
                "Upload correspondence - correspondence id is returned":
                    (response) =>
                        typeof response.correspondences?.[0]
                            ?.correspondenceId === "string" &&
                        response.correspondences[0].correspondenceId.length > 0,
                "Upload correspondence - expected recipient is returned":
                    (response) =>
                        response.correspondences?.[0]?.recipient ===
                        expectedRecipient,
                "Upload correspondence - one attachment id is returned":
                    (response) => response.attachmentIds?.length === 1,
                "Upload correspondence - attachment id is returned":
                    (response) =>
                        typeof response.attachmentIds?.[0] === "string" &&
                        response.attachmentIds[0].length > 0,
            });
        },
    );
}

export { handleSummary };
