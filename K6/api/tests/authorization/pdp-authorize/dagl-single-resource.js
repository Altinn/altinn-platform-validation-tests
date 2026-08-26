import exec from "k6/execution";

import { randomIntBetween } from "../../../../common-imports.js";
import { PersonalTokenGenerator } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, getOptions, segmentData } from "../../../../helpers.js";
import { requireEnv } from "../../../../helpers.js";
import { AuthorizePost } from "../../../building-blocks/authorization/authorize/post.js";
import { buildDaglRequest, getClients } from "./common-functions.js";

// Labels for different actions
const pdpAuthorizeLabel = { step: "PDP Authorize" };
const pdpAuthorizeLabelDenyPermit = { step: "PDP Authorize Deny" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

// Setup function to fetch test data and segment it for each VU. The CSV file should have columns: ssn, orgno, resourceid
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AUTHORIZATION_SUBSCRIPTION_KEY"]);
    const numberOfVUs = getNumberOfVUs();
    const data = fetchTestData(`authorization/pdp-authorize/dagl-single-resource/single-rights-${__ENV.ENVIRONMENT}-v2.csv`);
    const segmentedData = segmentData(data, numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 *
 * @param {any[][]} testData Single right delegations, one slice per VU.
 */
export default function (testData) {
    const [authorizeClient] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], (__ENV.RANDOMIZE ?? "true") === "true");
    const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(pdpAuthorizeLabelDenyPermit, pdpAuthorizeLabel);
    AuthorizePost(
        authorizeClient,
        buildDaglRequest(party.ssn, party.orgno, party.resourceid, action),
        expectedResponse,
        label
    );
}

/**
 * Function to randomly select action, label, and expected response.
 * 90% read with Permit, 10% sign with NotApplicable.
 *
 * @param {{[key: string]: string}} denyLabel Label used for the requests that are expected to be denied.
 * @param {{[key: string]: string}} permitLabel Label used for the requests that are expected to be permitted.
 * @returns {[string, {[key: string]: string}, string]} [action, label, expectedResponse]
 */
function getActionLabelAndExpectedResponse(denyLabel, permitLabel) {
    const randNumber = randomIntBetween(0, 10);
    switch (randNumber) {
        case 0:
            return ["sign", denyLabel, "NotApplicable"];
        default:
            return ["read", permitLabel, "Permit"];
    }
}
