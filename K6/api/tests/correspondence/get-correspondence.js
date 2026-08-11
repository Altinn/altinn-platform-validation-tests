import { group } from "k6";

import { CorrespondenceQueryBuilder } from "../../../clients/correspondence/index.js";
import { handleSummary } from "../../../common-imports.js";
import {
    GetCorrespondence,
    GetCorrespondenceContent,
    GetCorrespondences,
} from "../../building-blocks/correspondence/correspondence/index.js";
import { GetDialog } from "../../building-blocks/dialogporten/enduser/index.js";
import { CorrespondenceDomainChecks } from "../../domain-checks/correspondence/correspondence.js";
import {
    getCorrespondenceOptions,
    getCorrespondenceTestConfiguration,
    getDialogportenClient,
    getDialogTokenCorrespondenceClient,
    getEndUser,
    getRecipientClient,
    setupCorrespondenceTestData,
} from "./commons.js";

const listLabel = { step: "List correspondence ids" };
const overviewLabel = { step: "Get correspondence overview for content" };
const dialogLabel = { step: "Get Dialogporten dialog token" };
const contentLabel = { step: "Get correspondence content" };

export const options = getCorrespondenceOptions([
    listLabel,
    overviewLabel,
    dialogLabel,
    contentLabel,
]);

export function setup() {
    return setupCorrespondenceTestData();
}

/**
 * Test: list a recipient's correspondences, resolve the Dialogporten dialog
 * token for each one, and fetch its message content.
 *
 * @param {Array<{ssn: string}>} endUsers Shared end-user test data.
 */
export default function (endUsers) {
    const configuration = getCorrespondenceTestConfiguration();
    const recipient = getEndUser(endUsers).ssn;
    const correspondenceClient = getRecipientClient(recipient);
    const dialogportenClient = getDialogportenClient(recipient);
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

    for (const correspondenceId of selectedIds) {
        let overview;

        group("Get the correspondence's Dialogporten reference", function () {
            overview = GetCorrespondence(
                correspondenceClient,
                correspondenceId,
                overviewLabel,
            );
        });

        if (
            !CorrespondenceDomainChecks.CheckCorrespondenceOverview(
                overview,
                recipient,
                configuration.resourceId,
            )
        ) {
            continue;
        }

        const dialogId = CorrespondenceDomainChecks.FindDialogId(overview);

        if (!CorrespondenceDomainChecks.CheckDialogId(dialogId)) {
            continue;
        }

        let dialog;

        group("Get the matching Dialogporten dialog token", function () {
            dialog = GetDialog(
                dialogportenClient,
                dialogId,
                dialogLabel,
            );
        });

        if (!CorrespondenceDomainChecks.CheckDialogToken(dialog)) {
            continue;
        }

        group("Get content with the matching dialog token", function () {
            const dialogTokenClient = getDialogTokenCorrespondenceClient(
                dialog.dialogToken,
            );
            const content = GetCorrespondenceContent(
                dialogTokenClient,
                correspondenceId,
                contentLabel,
            );

            CorrespondenceDomainChecks.CheckMessageBody(content);
        });
    }
}

export { handleSummary };
