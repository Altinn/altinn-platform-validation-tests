import { group } from "k6";

import { CorrespondenceQueryBuilder } from "../../../clients/correspondence/index.js";
import { handleSummary } from "../../../common-imports.js";
import {
    GetCorrespondence,
    GetCorrespondences,
} from "../../building-blocks/correspondence/correspondence/index.js";
import { CorrespondenceDomainChecks } from "../../domain-checks/correspondence/correspondence.js";
import { CorrespondenceTestUser, getCorrespondenceOptions, getCorrespondenceTestConfiguration, getEndUser, getRecipientClient, setupCorrespondenceTestData } from "./commons.js";

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
 * @param {CorrespondenceTestUser[]} endUsers Shared end-user test data.
 */
export default function (endUsers) {
    const configuration = getCorrespondenceTestConfiguration();
    const endUser = getEndUser(endUsers);
    const recipient = endUser.ssn;
    const correspondenceClient = getRecipientClient(endUser);
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

    if (
        !CorrespondenceDomainChecks.CheckCorrespondenceIds(correspondenceIds)
    ) {
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

            CorrespondenceDomainChecks.CheckCorrespondenceOverview(
                overview,
                recipient,
                configuration.resourceId,
            );
        }
    });
}

export { handleSummary };
