import { getItemFromList, getOptions } from "../../../../helpers.js";
import { PdpAuthorizeDagl } from "../../../building-blocks/authentication/pdp-authorize/index.js";
import { getActionLabelAndExpectedResponse,getClients, getTokenOpts } from "./common-functions.js";
export { setup } from "./common-functions.js";
import exec from "k6/execution";

import { PersonalTokenGenerator } from "../../../../token-generator.js";

// Labels for different actions
const pdpAuthorizeLabel = { step: "PDP Authorize direct delegation" };
const pdpAuthorizeLabelDenyPermit = { step: "PDP Authorize Deny direct delegation" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

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
