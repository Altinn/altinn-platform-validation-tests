import { group } from "k6";
import exec from "k6/execution";
import { parseCsvData } from "../../../../helpers.js";
import http from "k6/http";

import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

import { LookupConsent } from "../../../building-blocks/authentication/consent/index.js";

const env = __ENV.ENVIRONMENT ?? "yt01";

export function setup() {
    // TODO - set to main before merging
    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/feature/consent-maskinporten-lookup/K6/testdata/authentication/consent/consentdata-${__ENV.ENVIRONMENT}.csv`
    );
    return parseCsvData(res.body);
}

function getLookupClient() {
    return new ConsentApiClient(
        __ENV.BASE_URL,
        new EnterpriseTokenGenerator(
            new Map([
                ["env", env],
                ["ttl", 3600],
                ["scopes", "altinn:maskinporten/consent.read"],
            ])
        )
    );
}

export default function (rows) {
    const lookupClient = getLookupClient();

    const i = exec.scenario.iterationInTest;
    const row = rows[i % rows.length];

    // TODO: TEMPORARILY - Fix before merge
    console.log(`LookupConsent: ${row.pid} ${row.orgNo} ${row.consentId}`);

    group("LookupConsent", () => {
        const pidUrn = `urn:altinn:person:identifier-no:${row.pid}`;
        const orgUrn = `urn:altinn:organization:identifier-no:${row.orgNo}`;

        LookupConsent(lookupClient, row.consentId, pidUrn, orgUrn);
    });
}
