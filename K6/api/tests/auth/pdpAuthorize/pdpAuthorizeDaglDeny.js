import { PdpAuthorizeDagl } from '../../../building_blocks/auth/pdpAuthorize/index.js';
import { getItemFromList } from '../../../../helpers.js';
import { getClients, getOptions, getTokenOpts } from './getClients.js';
import { randomIntBetween } from '../../../../commonImports.js';
export { setup } from './getClients.js';
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
  const org = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
  tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.ssn));
  const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(party, org);
  PdpAuthorizeDagl(
    pdpAuthorizeClient,
    party.ssn,
    org.orgno,
    resource,
    action,
    expectedResponse,
    __ENV.AUTHORIZATION_SUBSCRIPTION_KEY,
    label
  );
}

function getActionLabelAndExpectedResponse(org, client) { 
  const randNumber = randomIntBetween(0, 10);
  if (org === client) {
      if (randNumber % 2 == 0) {
          return ["read", pdpAuthorizeLabel, 'Permit']; 
      }
      else {
          return ["write", pdpAuthorizeLabel, 'Permit'];
      }
  }
  return ["read", pdpAuthorizeLabelDenyPermit, 'NotApplicable'];
} 