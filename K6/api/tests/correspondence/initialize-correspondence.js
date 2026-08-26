import { group } from "k6";

import { handleSummary } from "../../../common-imports.js";
import { InitializeCorrespondences } from "../../building-blocks/correspondence/correspondence/index.js";
import { CorrespondenceDomainChecks } from "../../domain-checks/correspondence/correspondence.js";
import { buildInitializeCorrespondenceRequest, CorrespondenceTestUser, getCorrespondenceOptions, getEndUser, getEnterpriseSenderClient, setupCorrespondenceTestData } from "./commons.js";

const initializeLabel = { step: "Initialize correspondence" };

export const options = getCorrespondenceOptions([initializeLabel]);

export function setup() {
    return setupCorrespondenceTestData();
}

/**
 * Test: initialize a correspondence for one end user per VU iteration.
 *
 * @param {CorrespondenceTestUser[]} endUsers Shared end-user test data.
 */
export default function (endUsers) {
    const recipient = getEndUser(endUsers).ssn;
    const correspondenceClient = getEnterpriseSenderClient();
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

        CorrespondenceDomainChecks.CheckInitializedCorrespondences(
            initializeResponse,
            [recipient],
        );
    });
}

export { handleSummary };
