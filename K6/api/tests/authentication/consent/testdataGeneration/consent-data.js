import exec from "k6/execution";
import { group } from "k6";

import { uuidv4, randomItem } from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";

import { ConsentApiClient } from "../../../../../clients/authentication/index.js";
import {
    PersonalTokenGenerator,
    EnterpriseTokenGenerator,
} from "../../../../../common-imports.js";
import { ConsentScope, ENDUSER_SCOPE } from "../../../../../scopes.js";

import {
    RequestConsent,
    ApproveConsent,
} from "../../../../building-blocks/authentication/consent/index.js";

import {
    consentValidTo,
    getBaseTokenOpts,
    getConsenteeOrgs,
    getConsenterPersons,
    getEnterpriseTokenOpts,
    getPersonalTokenOpts,
} from "../consent-commons.js";

//How many rows you want to generate for the consent data
const LOOKUPS = __ENV.LOOKUPS ? parseInt(__ENV.LOOKUPS) : 20;

export const options = {
    setupTimeout: "60s",
    scenarios: {
        default: {
            executor: "shared-iterations",
            vus: 2,
            iterations: LOOKUPS,
        },
    },
};

let consenteeClient;
let consenterClient;
let consenteeTokenGenerator;
let consenterTokenGenerator;

/*
 * Build the consentee (enterprise) and consenter (personal) clients once.
 * The token generators are module-level singletons whose identity (orgNo /
 * partyuuid) is set per iteration via setTokenGeneratorOptions.
 */
function getClients() {
    if (consenteeClient == undefined) {
        consenteeTokenGenerator = new EnterpriseTokenGenerator(
            getBaseTokenOpts(__ENV.ENVIRONMENT, ConsentScope.WRITE)
        );
        consenteeClient = new ConsentApiClient(__ENV.BASE_URL, consenteeTokenGenerator);
    }
    if (consenterClient == undefined) {
        consenterTokenGenerator = new PersonalTokenGenerator(
            getBaseTokenOpts(__ENV.ENVIRONMENT, ENDUSER_SCOPE)
        );
        consenterClient = new ConsentApiClient(__ENV.BASE_URL, consenterTokenGenerator);
    }
    return [consenteeClient, consenterClient];
}

function consentRights() {
    return [
        {
            action: ["consent"],
            resource: [
                { type: "urn:altinn:resource", value: "samtykke-performance-test" },
            ],
            metaData: { inntektsaar: "2026" },
        },
    ];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const env = __ENV.ENVIRONMENT;
    const orgs = getConsenteeOrgs(env);
    const persons = getConsenterPersons(env);

    const rows = [];
    for (let i = 0; i < LOOKUPS; i++) {
        // Random consentee org + consenter person per row, so consents spread.
        const org = randomItem(orgs);
        const person = randomItem(persons);

        rows.push({
            consentId: uuidv4(),
            pid: String(person.ssn),
            orgNo: String(org.orgNo),
            partyUuid: person.partyUuid,
        });
    }
    console.log(`Setup complete: Planned ${rows.length} consent(s)`);
    return rows;
}

export default function (rows) {
    group("Request + approve consent and generate .csv data", () => {
        const i = exec.scenario.iterationInTest;
        const row = rows[i];

        const [consenteeClient, consenterClient] = getClients();

        consenteeTokenGenerator.setTokenGeneratorOptions(
            getEnterpriseTokenOpts(__ENV.ENVIRONMENT, row.orgNo, ConsentScope.WRITE)
        );
        consenterTokenGenerator.setTokenGeneratorOptions(
            getPersonalTokenOpts(__ENV.ENVIRONMENT, row.partyUuid)
        );

        const pidUrn = `urn:altinn:person:identifier-no:${row.pid}`;
        const orgUrn = `urn:altinn:organization:identifier-no:${row.orgNo}`;

        RequestConsent(
            consenteeClient,
            row.consentId,
            pidUrn,
            orgUrn,
            consentValidTo(),
            consentRights(),
            "https://altinn.no"
        );

        ApproveConsent(consenterClient, row.consentId);
    });
}

export function teardown(rows) {
    let csv = "";

    try {
        csv += "Pid,Org,ConsentId\n";
        rows.forEach((r) => {
            csv += `${r.pid},${r.orgNo},${r.consentId}\n`;
        });
        console.log(csv);
    } catch (e) {
        console.log(`\nCSV_PRINT_FAILED: ${String(e)}\n`);
        console.log("\nWhat you have so far:" + csv + "\n");
    }
}
