import { check, group } from "k6";

import { CorrespondenceQueryBuilder } from "../../../clients/correspondence/index.js";
import { handleSummary } from "../../../common-imports.js";
import {
    GetCorrespondence,
    GetCorrespondences,
} from "../../building-blocks/correspondence/correspondence/index.js";
import {
    getCorrespondenceOptions,
    getCorrespondenceTestConfiguration,
    getEndUser,
    getExpectedRecipient,
    getRecipientClient,
    setupCorrespondenceTestData,
} from "./commons.js";

const listLabel = { step: "List correspondence ids" };
const overviewLabel = { step: "Get correspondence overview" };

export const options = getCorrespondenceOptions([listLabel, overviewLabel]);

export function setup() {
    return setupCorrespondenceTestData();
}

/**
 * Test: list the selected recipient's correspondences and fetch their
 * overviews.
 *
 * @param {Array<{ssn: string}>} endUsers Shared end-user test data.
 */
export default function (endUsers) {
    const configuration = getCorrespondenceTestConfiguration();
    const recipient = getEndUser(endUsers).ssn;
    const expectedRecipient = getExpectedRecipient(recipient);
    const correspondenceClient = getRecipientClient(recipient);
    const query = new CorrespondenceQueryBuilder()
        .withResourceId(configuration.resourceId)
        .withRole("Recipient")
        .withOnBehalfOf(recipient)
        .build();

    let correspondenceIds = [];

    group("A recipient can list correspondence ids", function () {
        correspondenceIds = GetCorrespondences(
            correspondenceClient,
            query,
            listLabel,
        );
    });

    const hasCorrespondences = check(correspondenceIds, {
        "Correspondence overview - at least one correspondence is available":
            (ids) => ids.length > 0,
    });

    if (!hasCorrespondences) {
        return;
    }

    const selectedIds = correspondenceIds.slice(
        0,
        configuration.maxItemsPerIteration,
    );

    group("A recipient can get correspondence overviews", function () {
        for (const correspondenceId of selectedIds) {
            const overview = GetCorrespondence(
                correspondenceClient,
                correspondenceId,
                overviewLabel,
            );

            check(overview, {
                "Correspondence overview - expected recipient is returned":
                    (value) => value?.recipient === expectedRecipient,
                "Correspondence overview - expected resource is returned":
                    (value) =>
                        value?.resourceId === configuration.resourceId,
            });
        }
    });
}

export { handleSummary };
