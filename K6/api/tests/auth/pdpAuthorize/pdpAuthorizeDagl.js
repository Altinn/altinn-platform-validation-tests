import { PdpAuthorizeDagl } from '../../../building_blocks/auth/pdpAuthorize/index.js';
import { getItemFromList, getOptions } from '../../../../helpers.js';
import { getClients, getTokenOpts, getActionLabelAndExpectedResponse } from './commonFunctions.js';
export { setup } from './commonFunctions.js';
import exec from 'k6/execution';

const directDelegation = (__ENV.DIRECT_DELEGATION ?? 'false') === 'true';;

// Labels for different actions
const pdpAuthorizeLabel = "PDP Authorize";
const pdpAuthorizeDirectDelegationLabel = "PDP Authorize Direct delegation";
const pdpAuthorizeLabelDenyPermit = "PDP Authorize Deny";
const pdpAuthorizeLabelDenyDirectDelegationPermit = "PDP Authorize Deny Direct delegation";
const tokenGeneratorLabel = "Personal Token Generator";

// resource with read/write for PRIV and DAGL
const resource1 = "ttd-dialogporten-performance-test-02";
// resource with read/write for DIRECT DELEGATION
const resource2 = "perf_direct_access_resource";

let labels = [pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel];
let denyLabel = pdpAuthorizeLabelDenyPermit;
let permitLabel = pdpAuthorizeLabel;
let resource = resource1;

// Override for direct delegation tests
if (directDelegation) {
  labels = [pdpAuthorizeDirectDelegationLabel, pdpAuthorizeLabelDenyDirectDelegationPermit, tokenGeneratorLabel];
  denyLabel = pdpAuthorizeLabelDenyDirectDelegationPermit;
  permitLabel = pdpAuthorizeDirectDelegationLabel;
  resource = resource2;
}

export const options = getOptions(labels);

/**
 * Main function executed by each VU.
 */
export default function (testData) {
  const [pdpAuthorizeClient, tokenGenerator] = getClients();
  const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
  tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.ssn));
  const [action, label, expectedResponse] = getActionLabelAndExpectedResponse( denyLabel, permitLabel);
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