import { check } from "k6";

import {
    CorrespondenceOverviewExt,
    InitializeCorrespondencesResponseExt,
} from "../../clients/correspondence/correspondence.types.js";

function NormalizeRecipient(recipient) {
    if (/^\d{11}$/.test(recipient)) {
        return `urn:altinn:person:identifier-no:${recipient}`;
    }

    if (/^(0192:)?\d{9}$/.test(recipient)) {
        return `urn:altinn:organization:identifier-no:${recipient.replace(/^0192:/, "")}`;
    }

    return recipient;
}

function SameMembers(actual, expected) {
    const actualSorted = [...actual].sort();
    const expectedSorted = [...expected].sort();

    return actualSorted.length === expectedSorted.length &&
        actualSorted.every(
            (value, index) => value === expectedSorted[index],
        );
}

/**
 * Checks the initialized correspondence records returned by a create or upload
 * operation.
 *
 * @param {InitializeCorrespondencesResponseExt} response API response.
 * @param {string[]} expectedRecipients Recipients supplied in the request.
 * @returns {boolean} True if the expected correspondences were returned.
 */
function CheckInitializedCorrespondences(response, expectedRecipients) {
    const correspondences = Array.isArray(response?.correspondences)
        ? response.correspondences
        : [];
    const expectedRecipientUrns = expectedRecipients.map(NormalizeRecipient);
    const returnedRecipients = correspondences.map((item) => item.recipient);

    const success = check(response, {
        "CheckInitializedCorrespondences - Expected number of correspondences is returned":
            () => correspondences.length === expectedRecipientUrns.length,
        "CheckInitializedCorrespondences - Every correspondence has an id":
            () =>
                correspondences.length > 0 &&
                correspondences.every(
                    (item) =>
                        typeof item.correspondenceId === "string" &&
                        item.correspondenceId.length > 0,
                ),
        "CheckInitializedCorrespondences - Expected recipients are returned":
            () => SameMembers(returnedRecipients, expectedRecipientUrns),
    });

    if (!success) {
        console.error(
            `CheckInitializedCorrespondences - expected recipients: ${JSON.stringify(expectedRecipientUrns)}`,
        );
        console.error(
            `CheckInitializedCorrespondences - returned correspondences: ${JSON.stringify(correspondences)}`,
        );
    }

    return success;
}

/**
 * Checks attachment ids returned by a correspondence upload operation.
 *
 * @param {InitializeCorrespondencesResponseExt} response API response.
 * @param {number} expectedCount Number of uploaded attachments.
 * @returns {boolean} True if the expected attachment ids were returned.
 */
function CheckAttachmentIds(response, expectedCount) {
    const attachmentIds = Array.isArray(response?.attachmentIds)
        ? response.attachmentIds
        : [];

    const success = check(response, {
        "CheckAttachmentIds - Expected number of attachment ids is returned":
            () => attachmentIds.length === expectedCount,
        "CheckAttachmentIds - Every attachment has an id": () =>
            attachmentIds.length > 0 &&
            attachmentIds.every(
                (attachmentId) =>
                    typeof attachmentId === "string" &&
                    attachmentId.length > 0,
            ),
    });

    if (!success) {
        console.error(
            `CheckAttachmentIds - expected ${expectedCount} attachment id(s), got: ${JSON.stringify(attachmentIds)}`,
        );
    }

    return success;
}

/**
 * Checks that a list operation returned correspondence ids to use in follow-up
 * calls.
 *
 * @param {string[]} correspondenceIds Correspondence ids from the list API.
 * @returns {boolean} True if at least one valid id was returned.
 */
function CheckCorrespondenceIds(correspondenceIds) {
    const ids = Array.isArray(correspondenceIds) ? correspondenceIds : [];

    const success = check(correspondenceIds, {
        "CheckCorrespondenceIds - At least one correspondence id is returned":
            () => ids.length > 0,
        "CheckCorrespondenceIds - Every correspondence has an id": () =>
            ids.length > 0 &&
            ids.every(
                (id) => typeof id === "string" && id.length > 0,
            ),
    });

    if (!success) {
        console.error(
            `CheckCorrespondenceIds - expected one or more ids, got: ${JSON.stringify(correspondenceIds)}`,
        );
    }

    return success;
}

/**
 * Checks that an overview belongs to the expected recipient and resource.
 *
 * @param {CorrespondenceOverviewExt|null} overview Correspondence overview.
 * @param {string} expectedRecipient Recipient supplied in the query.
 * @param {string} expectedResourceId Resource supplied in the query.
 * @returns {boolean} True if the overview matches the query context.
 */
function CheckCorrespondenceOverview(
    overview,
    expectedRecipient,
    expectedResourceId,
) {
    const expectedRecipientUrn = NormalizeRecipient(expectedRecipient);

    const success = check(overview, {
        "CheckCorrespondenceOverview - Expected recipient is returned":
            (value) => value?.recipient === expectedRecipientUrn,
        "CheckCorrespondenceOverview - Expected resource is returned":
            (value) => value?.resourceId === expectedResourceId,
    });

    if (!success) {
        console.error(
            `CheckCorrespondenceOverview - expected recipient '${expectedRecipientUrn}' and resource '${expectedResourceId}'`,
        );
        console.error(
            `CheckCorrespondenceOverview - returned recipient '${overview?.recipient}' and resource '${overview?.resourceId}'`,
        );
    }

    return success;
}

/**
 * Finds the Dialogporten dialog id in a Correspondence overview.
 *
 * @param {CorrespondenceOverviewExt|null} overview Correspondence overview.
 * @returns {string|null} Dialog id, or null when the reference is missing.
 */
function FindDialogId(overview) {
    const reference = overview?.externalReferences?.find(
        (item) => item.referenceType === "DialogportenDialogId",
    );

    return reference?.referenceValue ?? null;
}

/**
 * Checks that a Correspondence overview provided a Dialogporten dialog id.
 *
 * @param {string|null} dialogId Dialog id found in an overview.
 * @returns {boolean} True if the dialog id is present.
 */
function CheckDialogId(dialogId) {
    const success = check(dialogId, {
        "CheckDialogId - Dialogporten dialog id is returned": (value) =>
            typeof value === "string" && value.length > 0,
    });

    if (!success) {
        console.error(
            "CheckDialogId - the Correspondence overview did not contain a Dialogporten dialog id",
        );
    }

    return success;
}

/**
 * Checks that Dialogporten returned a dialog token.
 *
 * @param {{dialogToken?: string}|null} dialog Dialogporten dialog response.
 * @returns {boolean} True if a dialog token is present.
 */
function CheckDialogToken(dialog) {
    const success = check(dialog, {
        "CheckDialogToken - Dialog token is returned": (value) =>
            typeof value?.dialogToken === "string" &&
            value.dialogToken.length > 0,
    });

    if (!success) {
        console.error(
            "CheckDialogToken - Dialogporten did not return a dialog token",
        );
    }

    return success;
}

/**
 * Checks that the Correspondence content endpoint returned a message body.
 *
 * @param {string|null} messageBody Message body from the content endpoint.
 * @returns {boolean} True if a non-empty message body was returned.
 */
function CheckMessageBody(messageBody) {
    const success = check(messageBody, {
        "CheckMessageBody - Message body is returned": (body) =>
            typeof body === "string" && body.length > 0,
    });

    if (!success) {
        console.error(
            "CheckMessageBody - Correspondence content was empty or missing",
        );
    }

    return success;
}

export const CorrespondenceDomainChecks = {
    CheckInitializedCorrespondences,
    CheckAttachmentIds,
    CheckCorrespondenceIds,
    CheckCorrespondenceOverview,
    FindDialogId,
    CheckDialogId,
    CheckDialogToken,
    CheckMessageBody,
};
