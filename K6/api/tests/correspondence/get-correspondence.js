import { check, group } from "k6";

import { CorrespondenceQueryBuilder } from "../../../clients/correspondence/index.js";
import { handleSummary } from "../../../common-imports.js";
import {
    GetCorrespondence,
    GetCorrespondenceContent,
    GetCorrespondences,
} from "../../building-blocks/correspondence/correspondence/index.js";
import { GetDialog } from "../../building-blocks/dialogporten/enduser/index.js";
import {
    getCorrespondenceOptions,
    getCorrespondenceTestConfiguration,
    getDialogportenClient,
    getDialogTokenCorrespondenceClient,
    getEndUser,
    getExpectedRecipient,
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
    const expectedRecipient = getExpectedRecipient(recipient);
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

    const hasCorrespondences = check(correspondenceIds, {
        "Correspondence content - at least one correspondence is available":
            (ids) => ids.length > 0,
    });

    if (!hasCorrespondences) {
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

        const hasExpectedOverview = check(overview, {
            "Correspondence content - expected recipient is returned":
                (value) => value?.recipient === expectedRecipient,
            "Correspondence content - expected resource is returned":
                (value) => value?.resourceId === configuration.resourceId,
        });

        if (!hasExpectedOverview) {
            continue;
        }

        const dialogReference = overview?.externalReferences?.find(
            (reference) =>
                reference.referenceType === "DialogportenDialogId",
        );
        const hasDialogReference = check(dialogReference, {
            "Correspondence content - Dialogporten reference is present":
                (reference) =>
                    typeof reference?.referenceValue === "string" &&
                    reference.referenceValue.length > 0,
        });

        if (!hasDialogReference) {
            continue;
        }

        let dialog;

        group("Get the matching Dialogporten dialog token", function () {
            dialog = GetDialog(
                dialogportenClient,
                dialogReference.referenceValue,
                dialogLabel,
            );
        });

        const hasDialogToken = check(dialog, {
            "Correspondence content - dialog token is present": (value) =>
                typeof value?.dialogToken === "string" &&
                value.dialogToken.length > 0,
        });

        if (!hasDialogToken) {
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

            check(content, {
                "Correspondence content - message body is returned":
                    (body) => typeof body === "string" && body.length > 0,
            });
        });
    }
}

export { handleSummary };
