import { group } from "k6";
import http from "k6/http";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import { GetLatestChanges } from "../../../building-blocks/authentication/consent/index.js";
import { getOptions, parseCsvData, getItemFromList } from "../../../../helpers.js";

const getLatestChangesLabel = { action: "Get Latest Changes" };

export const options = getOptions([getLatestChangesLabel]);

export function setup() {
    if (!__ENV.ENVIRONMENT) throw new Error("Missing ENVIRONMENT");

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/consent/status/consent-latest-changes-${__ENV.ENVIRONMENT}.csv`
    );
    if (res.status !== 200) throw new Error(`Failed to fetch testdata for environment: ${__ENV.ENVIRONMENT}`);
    const rows = parseCsvData(res.body);
    if (!rows.length || !rows[0].OrgNo) throw new Error(`Missing OrgNo in testdata for environment: ${__ENV.ENVIRONMENT}`);
    return rows;
}

let client;

function getClient(orgNo) {
    if (!client) {
        const tokenGenerator = new EnterpriseTokenGenerator(
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

export default function (rows) {
    const { OrgNo } = getItemFromList(rows);
    group("Get latest consent request changes", () => {
        const body = GetLatestChanges(getClient(OrgNo), getLatestChangesLabel);
        if (!body) return;

        const token = getClient(OrgNo).tokenGenerator.getToken();
        let nextUrl = JSON.parse(body).links?.next ?? null;
        let pages = 1;

        while (nextUrl) {
            const res = http.get(nextUrl, {
                tags: getLatestChangesLabel,
                headers: { Authorization: "Bearer " + token },
            });
            pages++;
            nextUrl = JSON.parse(res.body).links?.next ?? null;
        }

        console.log(`Fetched ${pages} pages`);
    });
}

// export { handleSummary } from "../../../../common-imports.js";
