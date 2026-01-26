import { GetConnections } from "../../../../building-blocks/authentication/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { getClients, getTokenOpts } from "../common-functions.js";
import exec from "k6/execution";
export { setup } from "../common-functions.js";

// Labels for different actions
const getRightholdersToLabel = "Get rightholders to";
const tokenGeneratorLabel = "Personal Token Generator";

// get k6 options
export const options = getOptions([getRightholdersToLabel, tokenGeneratorLabel]);

/**
 * Main function executed by each VU.
 */
export default function (testData) {
    const bff = true;
    const [connectionsApiClient, tokenGenerator] = getClients(bff);
    const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.userId));
    const queryParamsTo = {
        party: party.orgUuid,
        to: party.orgUuid
    };
    GetConnections(
        connectionsApiClient,
        queryParamsTo,
        getRightholdersToLabel
    );
}
