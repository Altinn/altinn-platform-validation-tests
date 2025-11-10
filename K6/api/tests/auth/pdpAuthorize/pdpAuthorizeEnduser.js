import { PdpAuthorizeUser } from '../../../building_blocks/auth/pdpAuthorize/index.js';
import { getItemFromList, getOptions } from '../../../../helpers.js';
import { getClients, getTokenOpts, getActionLabelAndExpectedResponse } from './commonFunctions.js';
export { setup } from './commonFunctions.js';
import exec from 'k6/execution';

// Labels for different actions
const pdpAuthorizeLabel = "PDP Authorize";
const pdpAuthorizeLabelDenyPermit = "PDP Authorize Deny";
const tokenGeneratorLabel = "Personal Token Generator";

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

// resource with read/write for PRIV and DAGL
const resource = "ttd-dialogporten-performance-test-02";

/**
 * Main function executed by each VU.
 */
export default function (testData) {
  const [pdpAuthorizeClient, tokenGenerator] = getClients();
  const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
  tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.ssn));
  const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(pdpAuthorizeLabelDenyPermit, pdpAuthorizeLabel);
  PdpAuthorizeUser(
    pdpAuthorizeClient,
    party.ssn,
    resource,
    action,
    expectedResponse,
    __ENV.AUTHORIZATION_SUBSCRIPTION_KEY,
    label
  );
}