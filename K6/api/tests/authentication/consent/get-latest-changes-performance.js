import http from "k6/http";
import { group } from "k6";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import { GetLatestChanges } from "../../../building-blocks/authentication/consent/index.js";
import { getOptions, parseCsvData, getItemFromList } from "../../../../helpers.js";

const getLatestChangesLabel = { action: "Get Latest Changes" };

export const options = getOptions([getLatestChangesLabel]);

export function setup() {
    if (!__ENV.ENVIRONMENT) throw new Error("Missing ENVIRONMENT");

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/api/tests/authentication/consent/testdataGeneration/testdata-${__ENV.ENVIRONMENT}.csv`
    );
    if (res.status !== 200) throw new Error(`Failed to fetch testdata for environment: ${__ENV.ENVIRONMENT}`);
    const testdata = getItemFromList(parseCsvData(res.body));
    if (!testdata.orgNo) throw new Error(`Missing orgNo in testdata for environment: ${__ENV.ENVIRONMENT}`);
    return { orgNo: testdata.orgNo };
}

let client;
let tokenGenerator;

function getClient(orgNo) {
    if (!client) {
        tokenGenerator = new EnterpriseTokenGenerator(
            new Map([
                ["env", __ENV.ENVIRONMENT],
                ["ttl", 3600],
                ["scopes", "altinn:consentrequests.read"],
                ["orgNo", orgNo],
            ])
        );
        client = new ConsentApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return client;
}

export default function ({ orgNo }) {
    group("Get latest consent request changes", () => {
        const body = GetLatestChanges(getClient(orgNo), getLatestChangesLabel);
        if (!body) return;

        const parsed = JSON.parse(body);
        let nextUrl = parsed.links?.next ?? null;
        const token = tokenGenerator.getToken();
        let pages = 1;

        while (nextUrl) {
            const res = http.get(nextUrl, {
                tags: { ...getLatestChangesLabel, endpoint: nextUrl },
                headers: { Authorization: "Bearer " + token },
            });
            pages++;
            nextUrl = JSON.parse(res.body).links?.next ?? null;
        }

        console.log(`Fetched ${pages} pages`);
    });
}

// export { handleSummary } from "../../../../common-imports.js";
