import { check } from "k6";
import exec from "k6/execution";
import http from "k6/http";

import {
    BaseCorrespondenceBuilder,
    CorrespondenceClient,
    InitializeCorrespondencesBuilder,
} from "../../../clients/correspondence/index.js";
import { EnduserApiClient } from "../../../clients/dialogporten/enduser/index.js";
import {
    EnterpriseTokenBuilder,
    EnterpriseTokenGenerator,
    PersonalTokenBuilder,
    PersonalTokenGenerator,
    uuidv4,
} from "../../../common-imports.js";
import { getOptions, parseCsvData, requireEnv } from "../../../helpers.js";
import {
    AltinnScopes,
    CreateScopeString,
    DigDirScopes,
} from "../../../scopes.js";

const DEFAULT_ATTACHMENT_SIZE_BYTES = 50 * 1024;
const DEFAULT_MAX_ITEMS_PER_ITERATION = 20;

/**
 * Builds options for the Correspondence validation and performance tests.
 *
 * The shared getOptions helper creates tagged metrics for reporting, but its
 * empty thresholds do not make failed checks or HTTP requests fail a k6 run.
 * These scenarios only contain happy-path requests, so every check and HTTP
 * request must succeed.
 *
 * @param {{ [key: string]: string }[]} labels Request labels.
 * @returns {object} Strict k6 options for a Correspondence test.
 */
export function getCorrespondenceOptions(labels) {
    const options = getOptions(labels);

    options.thresholds.checks = ["rate>=1.0"];
    options.thresholds.http_req_failed = ["rate<=0.0"];

    return options;
}

/**
 * Normalizes a recipient in the same way as the Correspondence API response.
 * Test data normally contains bare national identity numbers, while response
 * payloads return recipient URNs.
 *
 * @param {string} recipient Recipient identifier from the request.
 * @returns {string} Expected recipient value in an API response.
 */
export function getExpectedRecipient(recipient) {
    if (/^\d{11}$/.test(recipient)) {
        return `urn:altinn:person:identifier-no:${recipient}`;
    }

    if (/^(0192:)?\d{9}$/.test(recipient)) {
        return `urn:altinn:organization:identifier-no:${recipient.replace(/^0192:/, "")}`;
    }

    return recipient;
}

/**
 * Defaults migrated from the existing Correspondence performance test data.
 * The YT01 resource differs because the old resource is not a Correspondence
 * service and cannot authorize these calls.
 */
const TEST_CONFIGURATION = {
    at23: {
        resourceId: "bruno-correspondence",
        serviceOwnerOrg: "digdir",
        serviceOwnerOrgNo: "991825827",
        serviceOwnerRepresentativePid: "20827199746",
    },
    tt02: {
        resourceId: "bruno-correspondence",
        serviceOwnerOrg: "digdir",
        serviceOwnerOrgNo: "991825827",
        serviceOwnerRepresentativePid: "20827199746",
    },
    yt01: {
        resourceId: "ttd-dialogporten-automated-tests-correspondence",
        serviceOwnerOrg: "ttd",
        serviceOwnerOrgNo: "713431400",
        serviceOwnerRepresentativePid: "27080618048",
    },
};

function parseBoolean(value, defaultValue) {
    if (value === undefined || value === "") {
        return defaultValue;
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    throw new Error(`Expected a boolean value, got '${value}'`);
}

function parsePositiveInteger(value, defaultValue, name) {
    const parsed = Number(value ?? defaultValue);

    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error(`${name} must be a positive integer`);
    }

    return parsed;
}

/**
 * Resolves environment-specific Correspondence test identities and workload
 * settings. Each value can be overridden for ad-hoc runs.
 *
 * @returns {{
 * resourceId: string,
 * recipientOverride: string|undefined,
 * serviceOwnerOrg: string,
 * serviceOwnerOrgNo: string,
 * serviceOwnerRepresentativePid: string,
 * ignoreReservation: boolean,
 * attachmentSizeBytes: number,
 * maxItemsPerIteration: number
 * }} Test configuration for the active environment.
 */
export function getCorrespondenceTestConfiguration() {
    const defaults = TEST_CONFIGURATION[__ENV.ENVIRONMENT] ?? {};
    const configuration = {
        resourceId: __ENV.CORRESPONDENCE_RESOURCE_ID ?? defaults.resourceId,
        recipientOverride: __ENV.CORRESPONDENCE_RECIPIENT,
        serviceOwnerOrg:
            __ENV.CORRESPONDENCE_SENDER_ORG ?? defaults.serviceOwnerOrg,
        serviceOwnerOrgNo:
            __ENV.CORRESPONDENCE_SENDER_ORG_NO ?? defaults.serviceOwnerOrgNo,
        serviceOwnerRepresentativePid:
            __ENV.CORRESPONDENCE_SENDER_PID ??
            defaults.serviceOwnerRepresentativePid,
        // Performance tests need a successful creation even when a synthetic
        // person is registered as reserved in KRR.
        ignoreReservation: parseBoolean(
            __ENV.CORRESPONDENCE_IGNORE_RESERVATION,
            true,
        ),
        attachmentSizeBytes: parsePositiveInteger(
            __ENV.CORRESPONDENCE_ATTACHMENT_SIZE_BYTES,
            DEFAULT_ATTACHMENT_SIZE_BYTES,
            "CORRESPONDENCE_ATTACHMENT_SIZE_BYTES",
        ),
        // The list endpoint is unpaginated. Cap the follow-up detail/content
        // calls so accumulated test data cannot make a scheduled run unbounded.
        maxItemsPerIteration: parsePositiveInteger(
            __ENV.CORRESPONDENCE_MAX_ITEMS_PER_ITERATION,
            DEFAULT_MAX_ITEMS_PER_ITERATION,
            "CORRESPONDENCE_MAX_ITEMS_PER_ITERATION",
        ),
    };

    const requiredConfiguration = {
        resourceId: configuration.resourceId,
        serviceOwnerOrg: configuration.serviceOwnerOrg,
        serviceOwnerOrgNo: configuration.serviceOwnerOrgNo,
        serviceOwnerRepresentativePid:
            configuration.serviceOwnerRepresentativePid,
    };
    const missing = Object.entries(requiredConfiguration)
        .filter(([, value]) => value === undefined || value === "")
        .map(([name]) => name);

    if (missing.length > 0) {
        throw new Error(
            `Missing Correspondence test configuration for ${__ENV.ENVIRONMENT}: ${missing.join(", ")}`,
        );
    }

    return configuration;
}

/**
 * Fetches the shared Dialogporten end-user data used by the migrated tests.
 * CORRESPONDENCE_RECIPIENT can replace the dataset for an ad-hoc run.
 *
 * @returns {Array<{ssn: string, orgno?: string}>} End users for the environment.
 */
export function setupCorrespondenceTestData() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const configuration = getCorrespondenceTestConfiguration();

    if (configuration.recipientOverride !== undefined) {
        return [{ ssn: configuration.recipientOverride }];
    }

    const url =
        "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/" +
        `K6/testdata/dialogporten/endusers/${__ENV.ENVIRONMENT}/endusers.csv`;
    const response = http.get(url, {
        tags: { action: "fetch-correspondence-test-data" },
    });

    const fetched = check(response, {
        "Correspondence test data - status code is 200": (res) =>
            res.status === 200,
    });

    if (!fetched) {
        throw new Error(
            `Unable to fetch Correspondence test data for ${__ENV.ENVIRONMENT}: HTTP ${response.status}`,
        );
    }

    const endUsers = parseCsvData(response.body).filter((item) => item.ssn);

    if (endUsers.length === 0) {
        throw new Error(
            `Correspondence test data for ${__ENV.ENVIRONMENT} contains no SSNs`,
        );
    }

    return endUsers;
}

/**
 * Selects a stable end user for the current VU and iteration.
 *
 * @param {Array<{ssn: string}>} endUsers Test data returned from setup.
 * @param {boolean} [singleUser=false] Always select the first user.
 * @returns {{ssn: string}} Selected end user.
 */
export function getEndUser(endUsers, singleUser = false) {
    if (!Array.isArray(endUsers) || endUsers.length === 0) {
        throw new Error("Correspondence test requires at least one end user");
    }

    if (singleUser) {
        return endUsers[0];
    }

    const vuOffset = Math.max(exec.vu.idInTest - 1, 0);
    const activeVus = Math.max(exec.instance.vusActive, 1);
    const index =
        (vuOffset + exec.vu.iterationInInstance * activeVus) % endUsers.length;

    return endUsers[index];
}

let personalSenderClient;
let enterpriseSenderClient;
let recipientClient;
let recipientTokenGenerator;
let dialogportenClient;
let dialogportenTokenGenerator;

/**
 * Returns the client used by a person representing the service owner.
 *
 * @returns {CorrespondenceClient} Cached personal sender client.
 */
export function getPersonalSenderClient() {
    if (personalSenderClient === undefined) {
        const configuration = getCorrespondenceTestConfiguration();
        const tokenGenerator = new PersonalTokenGenerator(
            new PersonalTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withScopes(
                    CreateScopeString([
                        AltinnScopes.CORRESPONDENCE.WRITE,
                    ]),
                )
                .withPid(configuration.serviceOwnerRepresentativePid)
                .withConsumerOrganizationNumber(
                    configuration.serviceOwnerOrgNo,
                )
                .build(),
        );

        personalSenderClient = new CorrespondenceClient(
            __ENV.BASE_URL,
            tokenGenerator,
        );
    }

    return personalSenderClient;
}

/**
 * Returns the client used directly by the service-owner organization.
 *
 * @returns {CorrespondenceClient} Cached enterprise sender client.
 */
export function getEnterpriseSenderClient() {
    if (enterpriseSenderClient === undefined) {
        const configuration = getCorrespondenceTestConfiguration();
        const tokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withScopes(
                    CreateScopeString([
                        AltinnScopes.CORRESPONDENCE.WRITE,
                        AltinnScopes.SERVICEOWNER.DEFAULT,
                    ]),
                )
                .withOrganization(configuration.serviceOwnerOrg)
                .withOrganizationNumber(configuration.serviceOwnerOrgNo)
                .build(),
        );

        enterpriseSenderClient = new CorrespondenceClient(
            __ENV.BASE_URL,
            tokenGenerator,
        );
    }

    return enterpriseSenderClient;
}

/**
 * Returns a Correspondence client authenticated as the selected recipient.
 *
 * @param {string} recipient Recipient SSN.
 * @returns {CorrespondenceClient} Cached recipient client.
 */
export function getRecipientClient(recipient) {
    const configuration = getCorrespondenceTestConfiguration();
    const options = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withScopes(
            CreateScopeString([AltinnScopes.CORRESPONDENCE.READ]),
        )
        .withPid(recipient)
        .withConsumerOrganizationNumber(configuration.serviceOwnerOrgNo)
        .build();

    if (recipientClient === undefined) {
        recipientTokenGenerator = new PersonalTokenGenerator(options);
        recipientClient = new CorrespondenceClient(
            __ENV.BASE_URL,
            recipientTokenGenerator,
        );
    } else {
        recipientTokenGenerator.setTokenGeneratorOptions(options);
    }

    return recipientClient;
}

/**
 * Returns a Dialogporten end-user client authenticated as the recipient.
 *
 * @param {string} recipient Recipient SSN.
 * @returns {EnduserApiClient} Cached Dialogporten end-user client.
 */
export function getDialogportenClient(recipient) {
    const options = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withScopes(
            CreateScopeString([DigDirScopes.DIALOGPORTEN.DEFAULT]),
        )
        .withPid(recipient)
        .build();

    if (dialogportenClient === undefined) {
        dialogportenTokenGenerator = new PersonalTokenGenerator(options);
        dialogportenClient = new EnduserApiClient(
            __ENV.BASE_URL,
            dialogportenTokenGenerator,
        );
    } else {
        dialogportenTokenGenerator.setTokenGeneratorOptions(options);
    }

    return dialogportenClient;
}

/**
 * Creates a Correspondence client backed by one Dialogporten dialog token.
 * Dialog tokens are scoped to their dialog and must not be reused for another
 * correspondence.
 *
 * @param {string} dialogToken Dialog token returned by Dialogporten.
 * @returns {CorrespondenceClient} Client for the supplied dialog token.
 */
export function getDialogTokenCorrespondenceClient(dialogToken) {
    return new CorrespondenceClient(
        __ENV.BASE_URL,
        { getToken: () => dialogToken },
    );
}

/**
 * Builds the current JSON initialization contract.
 *
 * @param {string} recipient Recipient SSN or organization number.
 * @returns {InitializeCorrespondencesExt} JSON initialization request.
 */
export function buildInitializeCorrespondenceRequest(recipient) {
    const configuration = getCorrespondenceTestConfiguration();
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
        .withIgnoreReservation(configuration.ignoreReservation)
        .build();

    return new InitializeCorrespondencesBuilder()
        .withCorrespondence(correspondence)
        .withRecipients([recipient])
        .withIdempotentKey(uuidv4())
        .build();
}

let attachmentPayload;

function getAttachmentPayload(size) {
    if (attachmentPayload === undefined || attachmentPayload.byteLength !== size) {
        const bytes = new Uint8Array(size);

        for (let index = 0; index < bytes.length; index++) {
            bytes[index] = 65 + (index % 26);
        }

        attachmentPayload = bytes.buffer;
    }

    return attachmentPayload;
}

/**
 * Builds the current multipart initialization contract with one new
 * Correspondence attachment.
 *
 * @param {string} recipient Recipient SSN or organization number.
 * @returns {object} Multipart form fields for k6/http.
 */
export function buildUploadCorrespondenceForm(recipient) {
    const configuration = getCorrespondenceTestConfiguration();
    const fileName = "k6-validation-attachment.txt";

    return {
        "request.Correspondence.ResourceId": configuration.resourceId,
        "request.Correspondence.SendersReference": uuidv4(),
        "request.Correspondence.Content.Language": "nb",
        "request.Correspondence.Content.MessageTitle": "k6 validation test",
        "request.Correspondence.Content.MessageSummary":
            "Correspondence with an attachment initialized by a k6 test",
        "request.Correspondence.Content.MessageBody":
            "# Correspondence attachment validation test",
        "request.Correspondence.Content.Attachments[0].FileName": fileName,
        "request.Correspondence.Content.Attachments[0].DisplayName": fileName,
        "request.Correspondence.Content.Attachments[0].IsEncrypted": "false",
        "request.Correspondence.Content.Attachments[0].SendersReference":
            uuidv4(),
        // 0 is NewCorrespondenceAttachment in the current API contract.
        "request.Correspondence.Content.Attachments[0].DataLocationType": "0",
        "request.Correspondence.IgnoreReservation": String(
            configuration.ignoreReservation,
        ),
        "request.Recipients[0]": recipient,
        "request.IdempotentKey": uuidv4(),
        attachments: http.file(
            getAttachmentPayload(configuration.attachmentSizeBytes),
            fileName,
            "text/plain",
        ),
    };
}
