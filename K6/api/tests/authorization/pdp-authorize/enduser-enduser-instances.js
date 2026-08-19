/*
 * Test for PDP Authorize - Enduser to Enduser instance delegations
*/
import exec from "k6/execution";

import { randomIntBetween } from "../../../../common-imports.js";
import { PersonalTokenGenerator } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, getOptions, segmentData } from "../../../../helpers.js";
import { requireEnv } from "../../../../helpers.js";
import { AuthorizePost } from "../../../building-blocks/authorization/authorize/post.js";
import { buildInstanceRequest, getClients } from "./common-functions.js";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : false;

// Labels for different actions
const pdpAuthorizeLabel = { step: "PDP Authorize" };
const pdpAuthorizeLabelDenyPermit = { step: "PDP Authorize Deny" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AUTHORIZATION_SUBSCRIPTION_KEY"]);
    const numberOfVUs = getNumberOfVUs();
    const data = fetchTestData(`authorization/pdp-authorize/enduser-enduser-instances/${__ENV.ENVIRONMENT}/user-user-instance-delegations.csv`);
    const segmentedData = segmentData(data, numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 *
 * @param {object[][]} testData Enduser to enduser instance delegations, one slice per VU.
 */
export default function (testData) {
    const [authorizeClient] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], randomize);
    const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(pdpAuthorizeLabelDenyPermit, pdpAuthorizeLabel);
    AuthorizePost(
        authorizeClient,
        buildInstanceRequest({
            toSsn: party.tossn,
            fromSsn: party.fromssn,
            resourceId: party.resourceid,
            instanceId: party.instanceid,
            task: party.task,
            action: action,
        }),
        expectedResponse,
        label
    );
}

/**
 * Function to randomly select action, label, and expected response.
 * 90% sign with Permit, 10% read with NotApplicable.
 * !! So far only Permit !!
 *
 * @param {{[key: string]: string}} denyLabel Label used for the requests that are expected to be denied.
 * @param {{[key: string]: string}} permitLabel Label used for the requests that are expected to be permitted.
 * @returns {Array} [action, label, expectedResponse]
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
