/**
 * Load on the internal /decision endpoint, mainly to load test the audit log.
 *
 * Every single decision request is queued as an authorization event, so this
 * fills the audit log queue with distinct requests: each row is its own
 * organization and daglig leder, and every answer is expected to be Permit.
 * Multi requests are not logged, and a request with a person identifier as
 * subject fails before it is, so neither would add load to the audit log.
 *
 * Run from K6/, e.g. k6 run --vus 5 --iterations 100 --duration 1m api/tests/authorization/pdp-authorize/dagl-decision.js
 */
import exec from "k6/execution";

import { buildAuthorizeRequest, buildXacmlJsonAttributeExternal } from "../../../../clients/authorization/builders.js";
import { DecisionClient } from "../../../../clients/authorization/decision.js";
import { randomItem } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, getOptions, requireEnv, segmentData } from "../../../../helpers.js";
import { DecisionPost } from "../../../building-blocks/authorization/decision/post.js";

const pdpDecisionLabel = { step: "PDP Decision" };

export const options = getOptions([pdpDecisionLabel]);

// resource with read/write for PRIV and DAGL
const resource = "ttd-dialogporten-performance-test-02";

/**
 * Setup function to segment data for VUs.
 *
 * @returns {any[][]} Organizations with the user id of their daglig leder, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AUTHORIZATION_SUBSCRIPTION_KEY"]);
    const numberOfVUs = getNumberOfVUs();
    const data = fetchTestData(`authorization/pdp-authorize/dagl-decision/orgs-dagl-${__ENV.ENVIRONMENT}.csv`);
    return segmentData(data, numberOfVUs);
}

/**
 * Main function executed by each VU.
 *
 * The internal endpoint does not accept a person identifier as subject, so the
 * daglig leder is identified by user id. It needs no token, only the subscription key.
 *
 * @param {any[][]} testData Organizations with the user id of their daglig leder, one slice per VU.
 */
export default function (testData) {
    const decisionClient = new DecisionClient(__ENV.BASE_URL, null, __ENV.AUTHORIZATION_SUBSCRIPTION_KEY);
    const party = getItemFromList(testData[exec.vu.idInTest - 1], (__ENV.RANDOMIZE ?? "true") === "true");
    const request = buildAuthorizeRequest(randomItem(["read", "write"]), [
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:userid",
            value: party.userId,
        }),
    ], [
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:resource",
            value: resource,
        }),
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:organization:identifier-no",
            value: party.orgno,
        }),
    ]);
    DecisionPost(
        decisionClient,
        JSON.stringify(request),
        "Permit",
        "application/json",
        pdpDecisionLabel
    );
}
