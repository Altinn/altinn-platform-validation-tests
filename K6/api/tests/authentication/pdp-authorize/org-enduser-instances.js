/*
 * Test for PDP Authorize - Organization to Enduser instance delegations
*/
import exec from "k6/execution";
import http from "k6/http";

import { randomIntBetween } from "../../../../common-imports.js";
import { PersonalTokenGenerator } from "../../../../common-imports.js";
import { getItemFromList, getNumberOfVUs, getOptions, parseCsvData, requireEnv, segmentData } from "../../../../helpers.js";
import { PdpAuthorizeOrgInstance } from "../../../building-blocks/authentication/pdp-authorize/index.js";
import { getClients } from "./common-functions.js";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : false;

// Labels for different actions
const pdpAuthorizeLabel = { step: "PDP Authorize" };
const pdpAuthorizeLabelDenyPermit = { step: "PDP Authorize Deny" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

export function setup() {
    requireEnv(["ENVIRONMENT", "AUTHORIZATION_SUBSCRIPTION_KEY"]);
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/pdp/${__ENV.ENVIRONMENT}/org-user-instance-delegations.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 */
export default function (testData) {
    const [pdpAuthorizeClient, tokenGenerator] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], randomize);
    const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(pdpAuthorizeLabelDenyPermit, pdpAuthorizeLabel);
    PdpAuthorizeOrgInstance(
        pdpAuthorizeClient,
        party.tossn,
        party.fromorg,
        party.resourceid,
        party.instanceid,
        party.task,
        action,
        expectedResponse,
        __ENV.AUTHORIZATION_SUBSCRIPTION_KEY,
        label
    );
}


/**
 * Function to randomly select action, label, and expected response.
 * 90% sign with Permit, 10% read with NotApplicable.
 * @return {Array} [action, label, expectedResponse]
 */
function getActionLabelAndExpectedResponse(denyLabel, permitLabel) {
    const randNumber = randomIntBetween(0, 10);
    switch (randNumber) {
        case 0:
            return ["read", permitLabel, "Permit"];
        default:
            return ["read", permitLabel, "Permit"];
    }
}
