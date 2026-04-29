import http from "k6/http";
import {
    PersonalTokenGenerator,
    EnterpriseTokenGenerator,
    uuidv4,
    randomItem,
} from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";
import { BffAccessManagementApiClient, ConsentApiClient } from "../../../../clients/authentication/index.js";
import {
    RequestConsent,
    ApproveConsent,
    LookupConsent,
} from "../../../building-blocks/authentication/consent/index.js";

import { GetConsentLog } from "../../../building-blocks/authentication/client-delegations/access-management.js";
import { getOptions } from "../../../../helpers.js";

export function setup() {
    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`
    );
    return parseCsvData(res.body);
}

let from = undefined;
let to = undefined;

function selectRandomFromToPair(data) {
    if (!from || !to) {
        from = randomItem(data);
        // Make sure to and from are not the same
        do {
            to = randomItem(data);
        } while (to === from);
    }
    return [from, to];
}

let consenterApiClient = undefined;
let consenteeApiClient = undefined;
let consentLookupApiClient = undefined;
let accessManagementApiClient = undefined;

function getClients(orgNo, userId, partyUuid) {
    if (
        consenterApiClient == undefined ||
        consenteeApiClient == undefined ||
        consentLookupApiClient == undefined
    ) {
        console.log("Configuring Clients");
        console.log(`orgNo: ${orgNo} -- userId: ${userId}`);
        // consentee
        const optionsConsentee = new Map();
        optionsConsentee.set("env", __ENV.ENVIRONMENT);
        optionsConsentee.set("ttl", 3600);
        optionsConsentee.set("scopes", "altinn:consentrequests.write");
        optionsConsentee.set("orgNo", orgNo);

        const tokenGeneratorConsentee = new EnterpriseTokenGenerator(
            optionsConsentee
        );
        consenteeApiClient = new ConsentApiClient(
            __ENV.BASE_URL,
            tokenGeneratorConsentee
        );

        // consenter
        const optionsConsenter = new Map();
        optionsConsenter.set("env", __ENV.ENVIRONMENT);
        optionsConsenter.set("ttl", 3600);
        optionsConsenter.set("scopes", "altinn:portal/enduser");
        optionsConsenter.set("userId", userId);
        optionsConsenter.set("partyuuid", partyUuid);

        const tokenGeneratorConsenter = new PersonalTokenGenerator(
            optionsConsenter
        );
        consenterApiClient = new ConsentApiClient(
            __ENV.BASE_URL,
            tokenGeneratorConsenter
        );

        // consent lookup (Maskinporten uses this endpoint to lookup consent before fetching the token)
        // Requires an org token with scope: altinn:maskinporten/consent.read
        const optionsConsentLookup = new Map();
        optionsConsentLookup.set("env", __ENV.ENVIRONMENT);
        optionsConsentLookup.set("ttl", 3600);
        optionsConsentLookup.set("scopes", "altinn:maskinporten/consent.read");
        const tokenGeneratorConsentLookup = new EnterpriseTokenGenerator(
            optionsConsentLookup
        );
        consentLookupApiClient = new ConsentApiClient(
            __ENV.BASE_URL,
            tokenGeneratorConsentLookup
        );

        accessManagementApiClient = new BffAccessManagementApiClient(__ENV.AM_UI_BASE_URL, tokenGeneratorConsenter);
    }
    return [consenteeApiClient, consenterApiClient, consentLookupApiClient, accessManagementApiClient];
}

// Labels for the different steps in the consent process, used for tagging requests in K6 and improving readability of test results.
const requestConsentLabel = { action: "Request Consent" };
const approveConsentLabel = { action: "Approve Consent" };
const getConsentLogLabel = { action: "Get Consent Log" };
const lookupConsentLabel = { action: "Lookup Consent" };

export const options = getOptions([requestConsentLabel, approveConsentLabel, getConsentLogLabel, lookupConsentLabel]);

export default function (data) {
    if (!__ENV.ENVIRONMENT) {
        throw new Error("Test aborted due to missing ENVIRONMENT variable.");
    }

    if (!from || !to) {
        [from, to] = selectRandomFromToPair(data);
    }

    let [consenteeApiClient, consenterApiClient, consentLookupApiClient, accessManagementApiClient] =
        getClients(to.orgNo, from.userId, from.partyUuid);

    const id = uuidv4();
    const personIdentifierNo = `urn:altinn:person:identifier-no:${from.ssn}`;
    const orgIdentifierNo = `urn:altinn:organization:identifier-no:${to.orgNo}`;
    const resource = "samtykke-performance-test";
    const consentRights = [
        {
            action: ["consent"],
            resource: [
                {
                    type: "urn:altinn:resource",
                    value: resource,
                }, // Vil alltid være bare en
            ],
            metaData: {
                inntektsaar: "2026",
            },
        },
    ];
    RequestConsent(
        consenteeApiClient,
        id,
        personIdentifierNo,
        orgIdentifierNo,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        consentRights,
        "https://altinn.no",
        requestConsentLabel
    );

    ApproveConsent(consenterApiClient, id, approveConsentLabel);

    GetConsentLog(accessManagementApiClient, from.partyUuid, getConsentLogLabel);

    LookupConsent(
        consentLookupApiClient,
        id,
        personIdentifierNo,
        orgIdentifierNo,
        lookupConsentLabel
    );
}
