import http from "k6/http";
import { check, group, fail } from "k6";

import { parseCsvData, getItemFromList } from "../../../../helpers.js";
import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { GetLatestChanges } from "../../../building-blocks/authentication/consent/index.js";

export function setup() {
    if (!__ENV.ENVIRONMENT) throw new Error("Missing ENVIRONMENT");

    const testdataRes = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/api/tests/authentication/consent/testdataGeneration/testdata-${__ENV.ENVIRONMENT}.csv`
    );
    if (testdataRes.status !== 200) throw new Error(`Failed to fetch testdata for environment: ${__ENV.ENVIRONMENT}`);
    const testdata = getItemFromList(parseCsvData(testdataRes.body));
    if (!testdata.orgNo) throw new Error(`Missing orgNo in testdata for environment: ${__ENV.ENVIRONMENT}`);

    const verificationRes = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/consent/consent-latest-changes-${__ENV.ENVIRONMENT}.csv`
    );
    const rows = verificationRes.status === 200 ? parseCsvData(verificationRes.body) : [];
    if (rows.length === 0) {
        console.warn(`No verification CSV found for environment ${__ENV.ENVIRONMENT}, skipping event-type verification`);
    }

    return { orgNo: testdata.orgNo, rows };
}

let enterpriseClient = undefined;
let enterpriseTokenGenerator = undefined;

function getClient(orgNo) {
    if (!enterpriseClient) {
        enterpriseTokenGenerator = new EnterpriseTokenGenerator(
            new Map([
                ["env", __ENV.ENVIRONMENT],
                ["ttl", 3600],
                ["scopes", "altinn:consentrequests.read"],
                ["orgNo", orgNo],
            ])
        );
        enterpriseClient = new ConsentApiClient(__ENV.BASE_URL, enterpriseTokenGenerator);
    }
    return enterpriseClient;
}

export default function ({ orgNo, rows }) {
    const client = getClient(orgNo);

    group(
        "Scenario: Latest changes contains the expected event types for known consent requests",
        () => {
            let allEvents = [];

            group("Step: Fetch all pages of latest changes", () => {
                const body = GetLatestChanges(client);
                if (!body) fail("Expected a response body from GetLatestChanges");

                const json = JSON.parse(body);
                const ok = check(json, {
                    "Response has 'data' array": (r) => Array.isArray(r.data),
                    "Response has 'links' field": (r) => "links" in r,
                });
                if (!ok) fail("Unexpected response structure from GetLatestChanges");

                allEvents.push(...json.data);

                const token = enterpriseTokenGenerator.getToken();
                let nextUrl = json.links?.next ?? null;
                let pages = 1;
                const MAX_PAGES = 100;

                while (nextUrl && pages < MAX_PAGES) {
                    const nextRes = http.get(nextUrl, {
                        headers: {
                            Authorization: "Bearer " + token,
                            "Content-type": "application/json",
                        },
                    });
                    check(nextRes, {
                        "Next page status is 200": (r) => r.status === 200,
                    });
                    const nextJson = JSON.parse(nextRes.body);
                    allEvents.push(...nextJson.data);
                    nextUrl = nextJson.links?.next ?? null;
                    pages++;
                }

                console.log(`Fetched ${pages} page(s), ${allEvents.length} total events`);
            });

            if (rows.length > 0) {
                group("Step: Verify expected events are present", () => {
                    for (const row of rows) {
                        const found = allEvents.some(
                            (e) =>
                                e.consentRequestId === row.ConsentId &&
                                e.eventType.toLowerCase() === row.EventType.toLowerCase()
                        );
                        check(found, {
                            [`Event '${row.EventType}' for consent '${row.ConsentId}' is present`]: (f) => f,
                        });
                    }
                });
            }
        }
    );
}

export { handleSummary } from "../../../../common-imports.js";
