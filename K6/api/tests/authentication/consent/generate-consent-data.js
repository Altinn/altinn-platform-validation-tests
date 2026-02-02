import http from "k6/http";
import { SharedArray } from "k6/data";
import exec from "k6/execution";
import { sha256 } from "k6/crypto";
import {
    PersonalTokenGenerator,
    EnterpriseTokenGenerator,
} from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";
import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import {
    RequestConsent,
    ApproveConsent,
} from "../../../building-blocks/authentication/consent/index.js";

// SharedArray must be created in init context, but CLI `--iterations` isn't available there.
// So we create a plan large enough for typical runs, and only *use* as many rows as actually ran.
// Override with `-e PlanSize=N` if desired.
const planSize = Number.parseInt(__ENV.PlanSize ?? "10000", 10) || 10000;

export function setup() {
    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`
    );
    orgsForSummary = parseCsvData(res.body);
    return orgsForSummary;
}

function deterministicUuidV4(seed) {
    const hex = sha256(seed, "hex").slice(0, 32).split("");

    // Version 4
    hex[12] = "4";
    // Variant 8..b
    const variantNibble = Number.parseInt(hex[16], 16);
    hex[16] = ((variantNibble & 0x3) | 0x8).toString(16);

    const h = hex.join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(
        16,
        20
    )}-${h.slice(20, 32)}`;
}

// Immutable shared "plan" for which testdata rows to use per iteration.
// SharedArray is read-only, so we precompute indices and then only read them.
const usedTestDataPlan = new SharedArray("usedTestDataPlan", function () {
    const env = __ENV.ENVIRONMENT ?? "yt01";
    const plan = [];
    for (let i = 0; i < planSize; i++) {
        plan.push({
            i,
            consentId: crypto.randomUUID(),
            // 'fromSeed' and 'toSeed' are deterministically generated seeds based on the environment name and iteration index.
            // They are intended to create stable, unique, but reproducible test data (such as fake org/person identifiers)
            // for each virtual user iteration – so each test run over the same input will always generate the same plan.
            // Example: fromSeed is a 32-bit integer from a truncated sha256 of `${env}:${i}:from` string.
            fromSeed:
        Number.parseInt(sha256(`${env}:${i}:from`, "hex").slice(0, 8), 16) >>>
        0,
            toSeed:
        Number.parseInt(sha256(`${env}:${i}:to`, "hex").slice(0, 8), 16) >>> 0,
        });
    }
    return plan;
});

let orgsForSummary = [];

function getClients(orgNo, userId, partyUuid) {
    // These tokens depend on org/user input, so don't cache a single pair across iterations.
    const optionsConsentee = new Map();
    optionsConsentee.set("env", __ENV.ENVIRONMENT);
    optionsConsentee.set("ttl", 3600);
    optionsConsentee.set("scopes", "altinn:consentrequests.write");
    optionsConsentee.set("orgNo", orgNo);

    const tokenGeneratorConsentee = new EnterpriseTokenGenerator(
        optionsConsentee
    );
    const consenteeApiClient = new ConsentApiClient(
        __ENV.BASE_URL,
        tokenGeneratorConsentee
    );

    const optionsConsenter = new Map();
    optionsConsenter.set("env", __ENV.ENVIRONMENT);
    optionsConsenter.set("ttl", 3600);
    optionsConsenter.set("scopes", "altinn:portal/enduser");
    optionsConsenter.set("userId", userId);
    optionsConsenter.set("partyuuid", partyUuid);

    const tokenGeneratorConsenter = new PersonalTokenGenerator(optionsConsenter);
    const consenterApiClient = new ConsentApiClient(
        __ENV.BASE_URL,
        tokenGeneratorConsenter
    );

    return [consenteeApiClient, consenterApiClient];
}

export default function (data) {
    if (!__ENV.ENVIRONMENT) {
        throw new Error("Test aborted due to missing ENVIRONMENT variable.");
    }

    const iterationIndex = exec.scenario.iterationInTest;
    const plan = usedTestDataPlan[iterationIndex];
    if (!plan) {
        throw new Error(
            `No usedTestDataPlan row for iteration ${iterationIndex} (PlanSize=${planSize}).`
        );
    }

    const len = data.length;
    const fromIdx = plan.fromSeed % len;
    let toIdx = plan.toSeed % len;
    if (toIdx === fromIdx) toIdx = (toIdx + 1) % len;

    const from = data[fromIdx];
    const to = data[toIdx];
    console.log("from", from.ssn, "to", to.orgNo);

    let [consenteeApiClient, consenterApiClient] = getClients(
        to.orgNo,
        from.userId,
        from.partyUuid
    );

    const id = plan.consentId;
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
        "https://altinn.no"
    );

    ApproveConsent(consenterApiClient, id);
}

export function handleSummary(summary) {
    const iterationsRun = summary?.metrics?.iterations?.values?.count ?? 0;
    const iterationsToReport = iterationsRun > 0 ? iterationsRun : 1;

    // Ensure we have org data (setup() state isn't guaranteed to be visible here).
    if (!orgsForSummary || orgsForSummary.length === 0) {
        const res = http.get(
            `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`
        );
        orgsForSummary = parseCsvData(res.body);
    }

    const header = "consentId, personIdentifierNo, orgIdentifierNo\n";
    const lines = [];
    const len = orgsForSummary.length;

    for (let i = 0; i < iterationsToReport; i++) {
        const plan = usedTestDataPlan[i];
        const fromIdx = plan.fromSeed % len;
        let toIdx = plan.toSeed % len;
        if (toIdx === fromIdx) toIdx = (toIdx + 1) % len;
        const from = orgsForSummary[fromIdx];
        const to = orgsForSummary[toIdx];

        lines.push(`${plan.consentId}, ${from?.ssn}, ${to?.orgNo}`);
    }

    const outFile = `testdata/authentication/consent/consentData-${__ENV.ENVIRONMENT}.csv`;

    return {
        stdout: `Wrote ${lines.length} rows to ${outFile}\n`,
        [outFile]: header + lines.join("\n"),
    };
}
