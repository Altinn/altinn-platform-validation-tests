#!/usr/bin/env node
// Turns Tenor CLI output into the businesses-<env>.csv the resource-registry
// tests read, looking each business up in Register for its Altinn party.
//
// Usage:
//   node hack/tenor-to-testdata.mjs --env <at22|at23|tt02> --out <file.csv> <tenor.json>...
//
// The JSON files are what `yarn tenor virksomheter --json` in
// altinn-access-management-frontend/playwright prints: a list of
// { organisasjonsnummer, navn }. Several files can be given, for instance one
// with AS and one with ENK businesses; duplicates are dropped.
//
// Register is asked for every organization number in batches, with a platform
// access token from the test token generator and the Register subscription
// key. The organization form comes from Register (unitType), not from the
// query that fetched the business, so the file says what Register says.
// A business Register does not know is dropped and counted; the run fails when
// nothing is left, so an empty file never gets written.
//
// Env vars: BASE_URL (platform host, e.g. https://platform.at23.altinn.cloud),
// TOKEN_GENERATOR_USERNAME, TOKEN_GENERATOR_PASSWORD, REGISTER_SUBSCRIPTION_KEY.
// No dependencies beyond Node 18+.

import { readFileSync, writeFileSync } from "node:fs";

const TOKEN_GENERATOR_URL = "https://altinn-testtools-token-generator.azurewebsites.net/api/GetPlatformAccessToken";
const BATCH_SIZE = 100;

function usage(message) {
    console.error(`${message}\n\nUsage: node hack/tenor-to-testdata.mjs --env <env> --out <file.csv> <tenor.json>...`);
    process.exit(2);
}

function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        usage(`Missing env var ${name}`);
    }

    return value;
}

function parseArgs(argv) {
    const args = { env: null, out: null, files: [] };

    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--env") {
            args.env = argv[++i];
        } else if (argv[i] === "--out") {
            args.out = argv[++i];
        } else {
            args.files.push(argv[i]);
        }
    }

    if (!args.env || !args.out || args.files.length === 0) {
        usage("--env, --out and at least one Tenor JSON file are required");
    }

    return args;
}

function readOrgNos(files) {
    const orgNos = new Set();

    for (const file of files) {
        const rows = JSON.parse(readFileSync(file, "utf8"));

        if (!Array.isArray(rows)) {
            usage(`${file} does not hold a JSON list`);
        }

        for (const row of rows) {
            const orgNo = String(row.organisasjonsnummer ?? "");

            if (!/^\d{9}$/.test(orgNo)) {
                usage(`${file} holds a row without a 9-digit organisasjonsnummer: ${JSON.stringify(row)}`);
            }

            orgNos.add(orgNo);
        }
    }

    return [...orgNos];
}

async function getPlatformToken(env) {
    const credentials = Buffer.from(`${requireEnv("TOKEN_GENERATOR_USERNAME")}:${requireEnv("TOKEN_GENERATOR_PASSWORD")}`).toString("base64");
    const url = `${TOKEN_GENERATOR_URL}?env=${encodeURIComponent(env)}&app=k6-e2e-tests&ttl=3600`;
    const response = await fetch(url, { headers: { Authorization: `Basic ${credentials}` } });

    if (!response.ok) {
        throw new Error(`Token generator answered ${response.status} for a platform token in ${env}`);
    }

    return (await response.text()).trim();
}

async function lookupParties(orgNos, env) {
    const token = await getPlatformToken(env);
    const url = `${requireEnv("BASE_URL")}/register/api/v1/access-management/parties/query?fields=party,org`;
    const subscriptionKey = requireEnv("REGISTER_SUBSCRIPTION_KEY");
    const parties = new Map();

    for (let offset = 0; offset < orgNos.length; offset += BATCH_SIZE) {
        const batch = orgNos.slice(offset, offset + BATCH_SIZE);
        const response = await fetch(url, {
            method: "POST",
            headers: {
                PlatformAccessToken: token,
                "Ocp-Apim-Subscription-Key": subscriptionKey,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ data: batch.map((orgNo) => `urn:altinn:organization:identifier-no:${orgNo}`) }),
        });

        if (!response.ok) {
            throw new Error(`Register answered ${response.status}: ${await response.text()}`);
        }

        const body = await response.json();

        for (const party of body.data ?? []) {
            if (party.organizationIdentifier && party.partyId && party.partyUuid) {
                parties.set(String(party.organizationIdentifier), party);
            }
        }
    }

    return parties;
}

function toCsv(orgNos, parties) {
    const lines = ["orgNo,partyId,partyUuid,orgForm"];
    const dropped = [];

    for (const orgNo of orgNos) {
        const party = parties.get(orgNo);

        if (!party) {
            dropped.push(orgNo);
            continue;
        }

        lines.push(`${orgNo},${party.partyId},${party.partyUuid},${party.unitType ?? ""}`);
    }

    return { csv: `${lines.join("\n")}\n`, kept: lines.length - 1, dropped };
}

const args = parseArgs(process.argv.slice(2));
const orgNos = readOrgNos(args.files).sort();
const parties = await lookupParties(orgNos, args.env);
const { csv, kept, dropped } = toCsv(orgNos, parties);

if (kept === 0) {
    throw new Error(`Register in ${args.env} knew none of the ${orgNos.length} businesses; nothing written`);
}

writeFileSync(args.out, csv);

const forms = {};

for (const line of csv.trim().split("\n").slice(1)) {
    const form = line.split(",")[3] || "?";
    forms[form] = (forms[form] ?? 0) + 1;
}

console.log(`${args.out}: ${kept} businesses ${JSON.stringify(forms)}, ${dropped.length} dropped (not in Register)${dropped.length ? `: ${dropped.join(", ")}` : ""}`);
