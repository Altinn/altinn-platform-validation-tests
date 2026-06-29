/**
 * Two-resource consent test — smoke scope: POST consent request only.
 *
 * Mirrors a production scenario where a single consent request covers TWO
 * different SKE resources at once:
 *   - ske-samtykke-sbl-inntekt                 (metadata: fraogmed, tilogmed)
 *   - ske-samtykke-sbl-summert-skattegrunnlag  (metadata: inntektsaar)
 *
 * The two resources require *different* consent metadata keys (see each
 * resource's consentMetadata in the Resource Registry, e.g.
 * https://platform.tt02.altinn.no/resourceregistry/api/v1/resource/ske-samtykke-sbl-inntekt),
 * so each consent right carries its own metaData object.
 *
 * For now this only exercises RequestConsent (does the two-resource request
 * POST succeed?). Approve / consent-log / lookup steps can be layered on later.
 *
 * Reuses the same building blocks and shared helpers as post-consent.js.
 */
import {
    EnterpriseTokenGenerator,
    uuidv4,
    randomItem,
} from "../../../../common-imports.js";
import { getOptions, requireEnv } from "../../../../helpers.js";
import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import { ConsentScope } from "../../../../scopes.js";
import { RequestConsent } from "../../../building-blocks/authentication/consent/index.js";

import {
    consentValidTo,
    getConsenteeOrgs,
    getConsenterPersons,
    getEnterpriseBaseTokenOpts,
    getEnterpriseTokenOpts,
} from "./consent-commons.js";

// Labels for the steps exercised, used for tagging requests in K6.
const requestConsentLabel = { action: "Request Consent" };

export const options = getOptions([requestConsentLabel]);

// Dedicated, fresh test-data pool for this scenario (no prior consent history),
// separate from the shared consent pool.
const TESTDATA_SUBFOLDER = "two-resources";

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const env = __ENV.ENVIRONMENT;
    return {
        orgs: getConsenteeOrgs(env, TESTDATA_SUBFOLDER),
        persons: getConsenterPersons(env, TESTDATA_SUBFOLDER),
    };
}

let consenteeApiClient;
let consenteeTokenGenerator;

function getClients() {
    if (consenteeApiClient == undefined) {
        consenteeTokenGenerator = new EnterpriseTokenGenerator(
            getEnterpriseBaseTokenOpts(__ENV.ENVIRONMENT, ConsentScope.WRITE)
        );
        consenteeApiClient = new ConsentApiClient(__ENV.BASE_URL, consenteeTokenGenerator);
    }
    return [consenteeApiClient];
}

// One consent right per resource. Each resource defines its own required
// consent metadata, so the metaData objects intentionally differ.
function consentRights() {
    return [
        {
            action: ["consent"],
            resource: [
                { type: "urn:altinn:resource", value: "ske-samtykke-sbl-inntekt" },
            ],
            metaData: { fraogmed: "2024-01-01", tilogmed: "2024-12-31" },
        },
        {
            action: ["consent"],
            resource: [
                { type: "urn:altinn:resource", value: "ske-samtykke-sbl-summert-skattegrunnlag" },
            ],
            metaData: { inntektsaar: "2024" },
        },
    ];
}

export default function (data) {
    const [consenteeApiClient] = getClients();

    // Pick a random consentee org and consenter person for this iteration so
    // consents spread across all organizations and persons.
    const org = randomItem(data.orgs);
    const person = randomItem(data.persons);

    consenteeTokenGenerator.setTokenGeneratorOptions(
        getEnterpriseTokenOpts(__ENV.ENVIRONMENT, org.orgNo, ConsentScope.WRITE)
    );

    const id = uuidv4();
    const personIdentifierNo = `urn:altinn:person:identifier-no:${person.ssn}`;
    const orgIdentifierNo = `urn:altinn:organization:identifier-no:${org.orgNo}`;

    RequestConsent(
        consenteeApiClient,
        id,
        personIdentifierNo,
        orgIdentifierNo,
        consentValidTo(),
        consentRights(),
        "https://altinn.no",
        requestConsentLabel
    );
}
