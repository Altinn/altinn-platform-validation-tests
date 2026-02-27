import { PdpAuthorizeDagl } from "../../../building-blocks/authentication/pdp-authorize/index.js";
import { getItemFromList, getOptions, segmentData, parseCsvData, getNumberOfVUs } from "../../../../helpers.js";
import { randomIntBetween } from "../../../../common-imports.js";
import { getClients } from "./common-functions.js";
import exec from "k6/execution";
import http from "k6/http";

// Labels for different actions
const pdpAuthorizeLabel = "PDP Authorize";
const pdpAuthorizeLabelDenyPermit = "PDP Authorize Deny";
const tokenGeneratorLabel = "Personal Token Generator";

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

// Setup function to fetch test data and segment it for each VU. The CSV file should have columns: ssn, orgno, resourceid
export function setup() {
  const numberOfVUs = getNumberOfVUs();
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/pdp-single-rights/K6/testdata/authentication/single-rights-${__ENV.ENVIRONMENT}.csv`);
  const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
  return segmentedData;
}

/**
 * Main function executed by each VU.
 */
export default function (testData) {
    const [pdpAuthorizeClient, tokenGenerator] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
    const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(pdpAuthorizeLabelDenyPermit, pdpAuthorizeLabel);
    PdpAuthorizeDagl(
        pdpAuthorizeClient,
        party.ssn,
        party.orgno,
        party.resourceid,
        action,
        expectedResponse,
        __ENV.AUTHORIZATION_SUBSCRIPTION_KEY,
        label
    );
}

/**
 * Function to randomly select action, label, and expected response.
 * 90% read with Permit, 10% sign with NotApplicable.
 * @return {Array} [action, label, expectedResponse]
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
