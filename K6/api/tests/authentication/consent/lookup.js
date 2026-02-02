import exec from "k6/execution";
import { check } from "k6";
import { SharedArray } from "k6/data";

import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { getOptions, parseCsvData } from "../../../../helpers.js";
import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import { LookupConsent } from "../../../building-blocks/authentication/consent/index.js";

const label = "consent-lookup";
const environment = __ENV.ENVIRONMENT ?? "yt01";

const consentRows = new SharedArray("consent-data-rows", () => {
  const csv = open(
    import.meta.resolve(
      `../../../../testdata/authentication/consent/consentData-${environment}.csv`
    )
  );
  const parsed = parseCsvData(csv);
  return (parsed ?? [])
    .map((r) => {
      // Headers in this file include spaces after the commas:
      // "consentId, personIdentifierNo, orgIdentifierNo"
      const consentId = String(r?.consentId ?? "").trim();
      const personIdentifierNo = String(
        r?.personIdentifierNo ?? r?.[" personIdentifierNo"] ?? ""
      ).trim();
      const orgIdentifierNo = String(
        r?.orgIdentifierNo ?? r?.[" orgIdentifierNo"] ?? ""
      ).trim();
      return { consentId, personIdentifierNo, orgIdentifierNo };
    })
    .filter((r) => r.consentId && r.personIdentifierNo && r.orgIdentifierNo);
});

export const options = {
  ...getOptions([label]),
  vus: 1,
  iterations: consentRows.length,
};

let consentLookupApiClient = undefined;
function getConsentLookupClient() {
  if (consentLookupApiClient) {
    return consentLookupApiClient;
  }

  const tokenOptions = new Map();
  tokenOptions.set("env", environment);
  tokenOptions.set("ttl", 3600);
  tokenOptions.set("scopes", "altinn:maskinporten/consent.read");
  // No orgNo required for this token according to requirements.

  const tokenGenerator = new EnterpriseTokenGenerator(tokenOptions);
  consentLookupApiClient = new ConsentApiClient(__ENV.BASE_URL, tokenGenerator);
  return consentLookupApiClient;
}

export default function () {
  if (!__ENV.BASE_URL) {
    throw new Error("Missing required env var: BASE_URL");
  }

  if (consentRows.length === 0) {
    throw new Error(
      `No consent rows found in consentData-${environment}.csv (expected at least 1 data row).`
    );
  }

  const idx = exec.scenario.iterationInTest;
  if (idx >= consentRows.length) {
    throw new Error(
      `Iteration ${idx} exceeded consentRows.length=${consentRows.length}`
    );
  }
  const row = consentRows[idx];

  const fromUrn = `urn:altinn:person:identifier-no:${row.personIdentifierNo}`;
  const toUrn = `urn:altinn:organization:identifier-no:${row.orgIdentifierNo}`;

  const client = getConsentLookupClient();
  LookupConsent(client, row.consentId, fromUrn, toUrn, label);
}
