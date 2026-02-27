import { PdpAuthorizeDagl } from "../../../building-blocks/authentication/pdp-authorize/index.js";
import { getItemFromList, getOptions, segmentData, parseCsvData, getNumberOfVUs } from "../../../../helpers.js";
import { getClients, getActionLabelAndExpectedResponse } from "./common-functions.js";
import exec from "k6/execution";
import http from "k6/http";

// Labels for different actions
const pdpAuthorizeLabel = "PDP Authorize";
const pdpAuthorizeLabelDenyPermit = "PDP Authorize Deny";
const tokenGeneratorLabel = "Personal Token Generator";

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

// resource with read/write for PRIV and DAGL
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
    //tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.ssn));
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
