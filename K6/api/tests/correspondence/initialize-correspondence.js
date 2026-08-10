import { check, group } from "k6";

import { handleSummary } from "../../../common-imports.js";
import { InitializeCorrespondences } from "../../building-blocks/correspondence/correspondence/index.js";
import {
    buildInitializeCorrespondenceRequest,
    getCorrespondenceOptions,
    getEndUser,
    getExpectedRecipient,
    getPersonalSenderClient,
    setupCorrespondenceTestData,
} from "./commons.js";

const initializeLabel = { step: "Initialize correspondence" };

export const options = getCorrespondenceOptions([initializeLabel]);

export function setup() {
    return setupCorrespondenceTestData();
}

/**
 * Test: initialize a correspondence for one end user per VU iteration.
 *
 * @param {Array<{ssn: string}>} endUsers Shared end-user test data.
 */
export default function (endUsers) {
    const recipient = getEndUser(endUsers).ssn;
    const expectedRecipient = getExpectedRecipient(recipient);
    const correspondenceClient = getPersonalSenderClient();
    const requestBody = buildInitializeCorrespondenceRequest(recipient);

    group("A service owner can initialize a correspondence", function () {
        const initializeResponse = InitializeCorrespondences(
            correspondenceClient,
            requestBody,
            initializeLabel,
        );

        if (initializeResponse === null) {
            return;
        }

        check(initializeResponse, {
            "Initialize correspondence - one correspondence is returned":
                (response) => response.correspondences?.length === 1,
            "Initialize correspondence - correspondence id is returned":
                (response) =>
                    typeof response.correspondences?.[0]
                        ?.correspondenceId === "string" &&
                    response.correspondences[0].correspondenceId.length > 0,
            "Initialize correspondence - expected recipient is returned":
                (response) =>
                    response.correspondences?.[0]?.recipient ===
                    expectedRecipient,
        });
    });
}

export { handleSummary };
