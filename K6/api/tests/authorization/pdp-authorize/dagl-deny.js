import exec from "k6/execution";

import { randomIntBetween } from "../../../../common-imports.js";
import { getItemFromList, getOptions, pickUnique } from "../../../../helpers.js";
import { PdpAuthorizeDagl } from "../../../building-blocks/authorization/pdp-authorize/index.js";
import { getClients, getTokenOpts } from "./common-functions.js";

export { setup } from "./common-functions.js";

import { PersonalTokenGenerator } from "../../../../common-imports.js";

// Labels for different actions
const pdpAuthorizeLabelDenyPermit = { step: "PDP Authorize Deny" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

export const options = getOptions([pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

// resource with read/write for PRIV and DAGL
const resource = "ttd-dialogporten-performance-test-02";

/**
 * Main function executed by each VU.
 *
 * @param testData
 */
export default function (testData) {
    const [pdpAuthorizeClient, tokenGenerator] = getClients();
    const [party, org] = pickUnique(testData[exec.vu.idInTest - 1], 2);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.ssn));
    const action = randomIntBetween(0, 1) === 0 ? "read" : "write";
    const expectedResponse = "NotApplicable";
    PdpAuthorizeDagl(
        pdpAuthorizeClient,
        party.ssn,
        org.orgno,
        resource,
        action,
        expectedResponse,
        __ENV.AUTHORIZATION_SUBSCRIPTION_KEY,
        pdpAuthorizeLabelDenyPermit
    );
}
