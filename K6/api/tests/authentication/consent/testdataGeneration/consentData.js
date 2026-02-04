import http from "k6/http";
import exec from "k6/execution";
import { group } from "k6";

import { uuidv4 } from "../../../../../common-imports.js";
import { parseCsvData } from "../../../../../helpers.js";

import { ConsentApiClient } from "../../../../../clients/authentication/index.js";
import {
  PersonalTokenGenerator,
  EnterpriseTokenGenerator,
} from "../../../../../common-imports.js";

import {
  RequestConsent,
  ApproveConsent,
} from "../../../../building-blocks/authentication/consent/index.js";

//How many rows you want to generate for the consent data
const LOOKUPS = __ENV.LOOKUPS ? parseInt(__ENV.LOOKUPS) : 2;

export const options = {
  //Should take less than a second really
  setupTimeout: "10s",
  scenarios: {
    default: {
      executor: "shared-iterations",
      vus: 10,
      iterations: LOOKUPS,
    },
  },
};

function getClients(orgNo, userId, partyUuid) {
  const consentee = new ConsentApiClient(
    __ENV.BASE_URL,
    new EnterpriseTokenGenerator(
      new Map([
        ["env", __ENV.ENVIRONMENT],
        ["ttl", 3600],
        ["scopes", "altinn:consentrequests.write"],
        ["orgNo", orgNo],
      ])
    )
  );

  const consenter = new ConsentApiClient(
    __ENV.BASE_URL,
    new PersonalTokenGenerator(
      new Map([
        ["env", __ENV.ENVIRONMENT],
        ["ttl", 3600],
        ["scopes", "altinn:portal/enduser"],
        ["userId", userId],
        ["partyuuid", partyUuid],
      ])
    )
  );

  return [consentee, consenter];
}

function selectFromToByIndex(data, i) {
  const from = data[i % data.length];
  const to = data[(i + 1) % data.length];
  return [from, to];
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
  if (!__ENV.ENVIRONMENT) throw new Error("Missing ENVIRONMENT");

  const res = http.get(
    `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`
  );

  const orgs = parseCsvData(res.body);
  const rows = [];

  for (let i = 0; i < LOOKUPS; i++) {
    const [from, to] = selectFromToByIndex(orgs, i);

    const consentId = uuidv4();

    rows.push({
      consentId,
      pid: String(from.ssn),
      orgNo: String(to.orgNo),
      fromUserId: from.userId,
      fromPartyUuid: from.partyUuid,
      toOrgNo: to.orgNo,
    });
  }
  console.log(`Setup complete: Planned ${rows.length} consent(s)`);
  return rows;
}

export default function (rows) {
  group("Request + approve consent and generate .csv data", () => {
    const i = exec.scenario.iterationInTest;
    const row = rows[i];

    const [consentee, consenter] = getClients(
      row.toOrgNo,
      row.fromUserId,
      row.fromPartyUuid
    );

    const pidUrn = `urn:altinn:person:identifier-no:${row.pid}`;
    const orgUrn = `urn:altinn:organization:identifier-no:${row.orgNo}`;

    RequestConsent(
      consentee,
      row.consentId,
      pidUrn,
      orgUrn,
      new Date(Date.now() + 36500 * 60 * 60 * 1000).toISOString(), // Consent shouldn't expire in 100 years
      consentRights(),
      "https://altinn.no"
    );

    ApproveConsent(consenter, row.consentId);
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
