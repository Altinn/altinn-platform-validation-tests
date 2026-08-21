import exec from "k6/execution";

import { getItemFromList, getOptions } from "../../../../helpers.js";
import { PersonalTokenGenerator } from "../../../../token-generator.js";
import { AuthorizePost } from "../../../building-blocks/authorization/authorize/post.js";
import { buildEnduserRequest, getActionLabelAndExpectedResponse, getClients, getTokenOpts } from "./common-functions.js";

export { setup } from "./common-functions.js";

// Labels for different actions
const pdpAuthorizeLabel = { step: "PDP Authorize" };
const pdpAuthorizeLabelDenyPermit = { step: "PDP Authorize Deny" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

// resource with read/write for PRIV and DAGL
const resource = "ttd-dialogporten-performance-test-02";

/**
 * Main function executed by each VU.
 *
 * @param {any[][]} testData Organizations with their daglig leder, one slice per VU.
 */
export default function (testData) {
    const [authorizeClient, tokenGenerator] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.ssn));
    const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(pdpAuthorizeLabelDenyPermit, pdpAuthorizeLabel);
    AuthorizePost(
        authorizeClient,
        buildEnduserRequest(party.ssn, resource, action),
        expectedResponse,
        label
    );
}
