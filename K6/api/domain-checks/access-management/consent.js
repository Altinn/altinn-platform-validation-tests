import { check } from "k6";

import { ConsentRequestDetailsDto } from "../../../clients/access-management/consent-enterprise/consent-enterprise.types.js";

/**
 * Checks that a created consent request echoes what it was asked for and carries
 * the fields the consentee needs to take the consenter through approval.
 *
 * @param {ConsentRequestDetailsDto|null} consentRequest - The created consent request.
 * @param {{id: string, from: string, to: string}} expected - What the consent request was created with.
 * @returns {boolean} True if the consent request matches, false otherwise.
 */
function CheckConsentRequestCreated(consentRequest, expected) {
    const required = ["id", "status", "viewUri"];
    const fields = /** @type {{[field: string]: unknown}} */ (consentRequest ?? {});
    const missing = required.filter((field) => fields[field] === undefined || fields[field] === null);

    const success = check(consentRequest, {
        "CheckConsentRequestCreated - Consent request echoes the id and the parties": (created) =>
            created !== null &&
            created.id === expected.id &&
            created.from === expected.from &&
            created.to === expected.to,
        "CheckConsentRequestCreated - Consent request carries id, status and view uri": () => missing.length === 0,
    });

    if (!success) {
        console.error(`CheckConsentRequestCreated - expected: ${JSON.stringify(expected)}`);
        if (missing.length > 0) {
            console.error(`CheckConsentRequestCreated - missing fields: ${JSON.stringify(missing)}`);
        }
        console.error(`CheckConsentRequestCreated - consent request returned: ${JSON.stringify(consentRequest)}`);
    }

    return success;
}

/**
 * Checks that a consent request has the expected status.
 *
 * @param {ConsentRequestDetailsDto|null} consentRequest - The consent request to check.
 * @param {string} expectedStatus - The status the consent request is expected to have.
 * @returns {boolean} True if the status matches, false otherwise.
 */
function CheckConsentRequestStatus(consentRequest, expectedStatus) {
    const success = check(consentRequest, {
        [`CheckConsentRequestStatus - Consent request has status '${expectedStatus}'`]: (request) =>
            request?.status === expectedStatus,
    });

    if (!success) {
        console.error(`CheckConsentRequestStatus - expected status '${expectedStatus}', got '${consentRequest?.status}'`);
    }

    return success;
}

/**
 * Checks that the consent request grants the rights it was asked to grant.
 *
 * Only the resource each right points at is compared. The actions and the
 * metadata are what the resource itself defines, so a mismatch there is a
 * resource problem rather than a consent problem.
 *
 * @param {ConsentRequestDetailsDto|null} consentRequest - The consent request to check.
 * @param {string[]} expectedResources - The resources the rights were asked for.
 * @returns {boolean} True if every expected resource is granted, false otherwise.
 */
function CheckConsentRights(consentRequest, expectedResources) {
    const grantedResources = (consentRequest?.consentRights ?? [])
        .flatMap((right) => right.resource ?? [])
        .map((resource) => resource.value);

    const missing = expectedResources.filter((resource) => !grantedResources.includes(resource));

    const success = check(consentRequest, {
        "CheckConsentRights - Consent request grants every requested resource": () => missing.length === 0,
    });

    if (!success) {
        console.error(`CheckConsentRights - resources not granted: ${JSON.stringify(missing)}`);
        console.error(`CheckConsentRights - resources granted: ${JSON.stringify(grantedResources)}`);
    }

    return success;
}

/**
 * Checks that an earlier step produced a consent request to act on.
 *
 * A group that needs one cannot say anything useful without it, so a caller that
 * gets false back should fail() and stop the run at the step that broke.
 *
 * @param {string|null|undefined} consentRequestId - The consent request id the earlier step should have produced.
 * @returns {consentRequestId is string} True if there is a consent request to act on, false otherwise.
 */
function CheckConsentRequestId(consentRequestId) {
    const success = check(consentRequestId, {
        "CheckConsentRequestId - An earlier step produced a consent request": (id) => {
            return id !== null && id !== undefined;
        },
    });

    if (!success) {
        console.error(`CheckConsentRequestId - expected a consent request id from an earlier step, got ${JSON.stringify(consentRequestId)}`);
    }

    return success;
}

/**
 * Checks that a consent request was approved.
 *
 * @param {boolean} approved - Whether the approve call reported success.
 * @returns {boolean} True if the consent request was approved, false otherwise.
 */
function CheckConsentApproved(approved) {
    const success = check(approved, {
        "CheckConsentApproved - Consent request was approved": (result) => result === true,
    });

    if (!success) {
        console.error(`CheckConsentApproved - approve did not report success, got '${approved}'`);
    }

    return success;
}

/**
 * Checks that a schema-less consent response came back with a body.
 *
 * The bff publishes no schema for the consent log, the active consents or the
 * Maskinporten lookup, so there is no shape to assert. What is worth asserting is
 * that the body parsed into something, since a 200 with an unparsable body still
 * reads as a pass on the status code alone.
 *
 * @param {any} response - The parsed response.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if there is a body to work with, false otherwise.
 */
function CheckConsentResponse(response, operation) {
    const success = check(response, {
        [`CheckConsentResponse - ${operation} returns a body`]: (body) =>
            body !== null && body !== undefined,
    });

    if (!success) {
        console.error(`CheckConsentResponse - ${operation} returned no usable body`);
    }

    return success;
}

export const ConsentDomainChecks = {
    CheckConsentApproved,
    CheckConsentRequestCreated,
    CheckConsentRequestId,
    CheckConsentRequestStatus,
    CheckConsentResponse,
    CheckConsentRights,
};
