import { group } from "k6";

import { handleSummary } from "../../../common-imports.js";
import { UploadCorrespondences } from "../../building-blocks/correspondence/correspondence/index.js";
import { AttachmentDomainChecks } from "../../domain-checks/correspondence/attachment.js";
import { CorrespondenceDomainChecks } from "../../domain-checks/correspondence/correspondence.js";
import {
    buildUploadCorrespondenceForm,
    getCorrespondenceOptions,
    getEndUser,
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

            CorrespondenceDomainChecks.CheckInitializedCorrespondences(
                uploadResponse,
                [recipient],
            );
            AttachmentDomainChecks.CheckAttachmentIds(uploadResponse, 1);
        },
    );
}

export { handleSummary };
