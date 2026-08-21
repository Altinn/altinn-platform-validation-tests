import { fail, group } from "k6";
import exec from "k6/execution";

import { ApproveConsentContextBuilder } from "../../../../../clients/access-management-bff/consent/index.js";
import { randomItem, uuidv4 } from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";
import { EnterpriseCreateConsentRequest } from "../../../../building-blocks/access-management/consent-enterprise/index.js";
import { ApproveConsentRequest } from "../../../../building-blocks/access-management-bff/consent/index.js";
import { ConsentDomainChecks } from "../../../../domain-checks/access-management/consent.js";
import {
    createConsentRequest,
    getClients,
    getConsenteeOrgs,
    getConsenteeTokenOpts,
    getConsenterPersons,
    getConsenterTokenOpts,
    lookupConsentValidTo,
    organizationUrn,
    personUrn,
} from "../commons.js";

// How many rows of consent data to generate.
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

/**
 * Plans one consent per iteration, so the default function can request and
 * approve exactly the rows the teardown prints.
 *
 * @returns {Array<{consentId: string, pid: string, orgNo: string, partyUuid: string}>} The consents to generate.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    const env = __ENV.ENVIRONMENT;
    const orgs = getConsenteeOrgs(env);
    const persons = getConsenterPersons(env);

    const rows = [];
    for (let i = 0; i < LOOKUPS; i++) {
        // Random organization and person per row, so the consents spread.
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

/**
 * Generates the consents lookup.js reads.
 *
 * Not a test of anything on its own: it requests and approves one consent per
 * iteration and the teardown prints them as csv. The checks are here so a run
 * that silently produced nothing is not mistaken for one that produced data.
 *
 * @param {Array<{consentId: string, pid: string, orgNo: string, partyUuid: string}>} rows The consents planned in setup.
 */
export default function (rows) {
    const [clients, consenteeTokenGenerator, consenterTokenGenerator] = getClients();

    // One iteration per planned row, so every row is generated exactly once.
    const row = rows[exec.scenario.iterationInTest];

    consenteeTokenGenerator.setTokenGeneratorOptions(getConsenteeTokenOpts(row.orgNo));
    consenterTokenGenerator.setTokenGeneratorOptions(getConsenterTokenOpts(row.partyUuid));

    group("Request and approve a consent, so it can be looked up later", function () {
        const from = personUrn(row.pid);
        const to = organizationUrn(row.orgNo);

        // Long lived on purpose: this data is committed and read by lookup.js for a long
        // time, unlike the short lived consents post-consent.js creates on every run.
        const consentRequest = createConsentRequest({
            consentId: row.consentId,
            from,
            to,
            validTo: lookupConsentValidTo(),
        });

        const createdRequest = EnterpriseCreateConsentRequest(clients.consentee.enterpriseClient, consentRequest);

        ConsentDomainChecks.CheckConsentRequestCreated(createdRequest, { id: row.consentId, from, to });

        if (!ConsentDomainChecks.CheckConsentRequestId(createdRequest?.id)) {
            fail("Cannot approve: creating the consent request returned no id");
        }

        const context = new ApproveConsentContextBuilder()
            .withLanguage("nb")
            .build();

        const approved = ApproveConsentRequest(clients.consenter.consentClient, createdRequest.id, context);

        ConsentDomainChecks.CheckConsentApproved(approved);
    });
}

/**
 * Prints the generated consents as the csv lookup.js reads.
 *
 * The output is copied into K6/testdata/authentication/consent/lookup/<env>.csv by
 * hand, since a k6 run cannot write back to the repo.
 *
 * @param {Array<{consentId: string, pid: string, orgNo: string}>} rows The consents that were generated.
 */
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
