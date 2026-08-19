import exec from "k6/execution";

import { getItemFromList, getOptions } from "../../../../helpers.js";
import { AuthorizePost } from "../../../building-blocks/authorization/authorize/post.js";
import { buildDaglRequest, getActionLabelAndExpectedResponse, getClients, getTokenOpts } from "./common-functions.js";

export { setup } from "./common-functions.js";

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
 *
 * @param {object[][]} testData Organizations with their daglig leder, one slice per VU.
 */
export default function (testData) {
    const [authorizeClient, tokenGenerator] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.ssn));
    const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(pdpAuthorizeLabelDenyPermit, pdpAuthorizeLabel);
    AuthorizePost(
        authorizeClient,
        buildDaglRequest(party.ssn, party.orgno, resource, action),
        expectedResponse,
        label
    );
}
