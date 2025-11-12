import http from "k6/http";
import {
    PersonalTokenGenerator,
    EnterpriseTokenGenerator,
    uuidv4,
    randomItem
} from "../../../../commonImports.js";
import { parseCsvData } from "../../../../helpers.js";
import { ConsentApiClient } from "../../../../clients/auth/index.js";
import { RequestConsent, ApproveConsent } from "../../../building_blocks/auth/consent/index.js";

export function setup() {
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/auth/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`);
    return parseCsvData(res.body);
}

let from = undefined;
let to = undefined;

function selectRandomFromToPair(data) {
    console.log(from, to);
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

function getClients(orgNo, userId, partyUuid) {
    if (consenterApiClient == undefined || consenteeApiClient == undefined) {
        console.log("Configuring Clients");
        console.log(`orgNo: ${orgNo} -- userId: ${userId}`);
        // consentee
        const optionsConsentee = new Map();
        optionsConsentee.set("env", __ENV.ENVIRONMENT);
        optionsConsentee.set("ttl", 3600);
        optionsConsentee.set("scopes", "altinn:consentrequests.write");
        //optionsConsentee.set("org", "ttd");
        optionsConsentee.set("orgNo", orgNo);

        const tokenGeneratorConsentee
            = new EnterpriseTokenGenerator(optionsConsentee);
        consenteeApiClient
            = new ConsentApiClient(__ENV.BASE_URL, tokenGeneratorConsentee);

        // consenter
        const optionsConsenter = new Map();
        optionsConsenter.set("env", __ENV.ENVIRONMENT);
        optionsConsenter.set("ttl", 3600);
        optionsConsenter.set("scopes", "altinn:portal/enduser");
        optionsConsenter.set("userId", userId);
        optionsConsenter.set("partyuuid", partyUuid);

        const tokenGeneratorConsenter
            = new PersonalTokenGenerator(optionsConsenter);
        consenterApiClient
            = new ConsentApiClient(__ENV.BASE_URL, tokenGeneratorConsenter);
    }
    return [consenteeApiClient, consenterApiClient];
}


export default function (data) {
    if (!from || !to) {
        [from, to] = selectRandomFromToPair(data);
    }

    let [consenteeApiClient, consenterApiClient] = getClients(to.orgNo, from.userId, from.partyUuid);

    const id = uuidv4();
    const personIdentifierNo = `urn:altinn:person:identifier-no:${from.ssn}`;
    const orgIdentifierNo = `urn:altinn:organization:identifier-no:${to.orgNo}`;
    const resource = "samtykke-performance-test";
    const consentRights = [{
        "action": ["consent"],
        "resource": [
            {
                "type": "urn:altinn:resource",
                "value": resource
            } // Vil alltid være bare en
        ],
        "metaData": {
            "inntektsaar": "2026"
        }
    }
    ];
    let response = RequestConsent(
        consenteeApiClient,
        id,
        personIdentifierNo,
        orgIdentifierNo,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        consentRights,
        "https://altinn.no"
    );

    response = ApproveConsent(consenterApiClient, id);
}
