import { GetAccessPackages } from '../../../building_blocks/auth/connections/index.js';
import { getItemFromList, getOptions } from '../../../../helpers.js';
import { getClients, getTokenOpts } from './getClients.js';
import exec from 'k6/execution';
export { setup } from './getClients.js';

// Labels for different actions
const GetAccessPackagesToLabel = "Get accesspackages to";
const GetAccessPackagesFromLabel = "Get accesspackages from";
const tokenGeneratorLabel = "Personal Token Generator";

// get k6 options
export const options = getOptions([GetAccessPackagesToLabel, GetAccessPackagesFromLabel, tokenGeneratorLabel]);

/**
 * Main function executed by each VU.
 */
export default function (testData) {
  const [connectionsApiClient, tokenGenerator] = getClients();
  const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
  tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.userId));
  const queryParamsTo = {
    party: party.orgUuid,
    to: party.orgUuid
  };
  GetAccessPackages(
    connectionsApiClient,
    queryParamsTo,
    GetAccessPackagesToLabel
  );
}