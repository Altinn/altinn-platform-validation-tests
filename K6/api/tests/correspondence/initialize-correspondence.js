import { check, group } from "k6";

import {
    BaseCorrespondenceBuilder,
    InitializeCorrespondencesBuilder,
} from "../../../clients/correspondence/index.js";
import { handleSummary, uuidv4 } from "../../../common-imports.js";
import { getOptions, requireEnv } from "../../../helpers.js";
import { InitializeCorrespondences } from "../../building-blocks/correspondence/correspondence/index.js";
import {
    getClients,
    getCorrespondenceTestConfiguration,
} from "./commons.js";

const initializeLabel = { step: "Initialize correspondence" };

export const options = getOptions([initializeLabel]);

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    getCorrespondenceTestConfiguration();
}

/**
 * Test: initialize a correspondence
 */
export default function () {
    const configuration = getCorrespondenceTestConfiguration();
    const [correspondenceClient] = getClients();

    const correspondence = new BaseCorrespondenceBuilder()
        .withResourceId(configuration.resourceId)
        .withSendersReference(uuidv4())
        .withContent({
            language: "nb",
            messageTitle: "k6 validation test",
            messageSummary: "Correspondence initialized by a k6 test",
            messageBody: "# Correspondence validation test",
            attachments: [],
        })
        .build();

    const requestBody = new InitializeCorrespondencesBuilder()
        .withCorrespondence(correspondence)
        .withRecipients([configuration.recipient])
        .withIdempotentKey(uuidv4())
        .build();

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
        });
    });
}

export { handleSummary };
