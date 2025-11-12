import { PdpAuthorizeDagl } from "../../../building_blocks/auth/pdpAuthorize/index.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { getClients, getTokenOpts } from "./commonFunctions.js";
import { randomIntBetween } from "../../../../commonImports.js";
export { setup } from "./commonFunctions.js";
import exec from "k6/execution";

// Labels for different actions
const pdpAuthorizeLabelDenyPermit = "PDP Authorize Deny";
const tokenGeneratorLabel = "Personal Token Generator";

export const options = getOptions([pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

// resource with read/write for PRIV and DAGL
const resource = "ttd-dialogporten-performance-test-02";

/**
 * Main function executed by each VU.
 */
export default function (testData) {
    const [pdpAuthorizeClient, tokenGenerator] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
    let org = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
    while (party.orgno === org.orgno) {
    // ensure org is different from party's org
        org = getItemFromList(testData[exec.vu.idInTest - 1], true);
    }
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
