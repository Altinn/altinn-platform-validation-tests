import { check, group } from "k6";

import { handleSummary } from "../../../common-imports.js";
import { UploadCorrespondences } from "../../building-blocks/correspondence/correspondence/index.js";
import {
    buildUploadCorrespondenceForm,
    getCorrespondenceOptions,
    getEndUser,
    getExpectedRecipient,
    getPersonalSenderClient,
    setupCorrespondenceTestData,
} from "./commons.js";

const uploadLabel = {
    step: "Initialize and upload correspondence for one recipient",
};

export const options = getCorrespondenceOptions([uploadLabel]);

export function setup() {
    return setupCorrespondenceTestData();
}

/**
 * Test: initialize a correspondence with a 50 KiB attachment for one fixed
 * end user, using a person who represents the service owner.
 *
 * @param {Array<{ssn: string}>} endUsers Shared end-user test data.
 */
export default function (endUsers) {
    const recipient = getEndUser(endUsers, true).ssn;
    const expectedRecipient = getExpectedRecipient(recipient);
    const correspondenceClient = getPersonalSenderClient();
    const formData = buildUploadCorrespondenceForm(recipient);

    group(
        "A representative can upload correspondences for one recipient",
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
                "Single-recipient upload - one correspondence is returned":
                    (response) => response.correspondences?.length === 1,
                "Single-recipient upload - correspondence id is returned":
                    (response) =>
                        typeof response.correspondences?.[0]
                            ?.correspondenceId === "string" &&
                        response.correspondences[0].correspondenceId.length > 0,
                "Single-recipient upload - expected recipient is returned":
                    (response) =>
                        response.correspondences?.[0]?.recipient ===
                        expectedRecipient,
                "Single-recipient upload - one attachment id is returned":
                    (response) => response.attachmentIds?.length === 1,
                "Single-recipient upload - attachment id is returned":
                    (response) =>
                        typeof response.attachmentIds?.[0] === "string" &&
                        response.attachmentIds[0].length > 0,
            });
        },
    );
}

export { handleSummary };
