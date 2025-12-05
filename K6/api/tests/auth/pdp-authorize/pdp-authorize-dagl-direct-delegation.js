import { PdpAuthorizeDagl } from "../../../building-blocks/auth/pdp-authorize/index.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { getClients, getTokenOpts, getActionLabelAndExpectedResponse } from "./common-functions.js";
export { setup } from "./common-functions.js";
import exec from "k6/execution";

// Labels for different actions
const pdpAuthorizeLabel = "PDP Authorize direct delegation";
const pdpAuthorizeLabelDenyPermit = "PDP Authorize Deny direct delegation";
const tokenGeneratorLabel = "Personal Token Generator";

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

// resource with read/write for PRIV and DAGL
const resource = "perf_direct_access_resource";

/**
 * Main function executed by each VU.
 */
export default function (testData) {
    const [pdpAuthorizeClient, tokenGenerator] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.ssn));
    const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(pdpAuthorizeLabelDenyPermit, pdpAuthorizeLabel);
    PdpAuthorizeDagl(
        pdpAuthorizeClient,
        party.ssn,
        party.orgno,
        resource,
        action,
        expectedResponse,
        __ENV.AUTHORIZATION_SUBSCRIPTION_KEY,
        label
    );
}
