import { check, group } from "k6";

import { handleSummary } from "../../../common-imports.js";
import { getOptions } from "../../../helpers.js";
import { UploadCorrespondences } from "../../building-blocks/correspondence/correspondence/index.js";
import {
    buildUploadCorrespondenceForm,
    getEndUser,
    getEnterpriseSenderClient,
    setupCorrespondenceTestData,
} from "./commons.js";

const uploadLabel = { step: "Initialize and upload correspondence" };

export const options = getOptions([uploadLabel]);

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
                "Upload correspondence - one attachment id is returned":
                    (response) => response.attachmentIds?.length === 1,
            });
        },
    );
}

export { handleSummary };
