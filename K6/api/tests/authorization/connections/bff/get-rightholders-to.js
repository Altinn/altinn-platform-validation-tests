import exec from "k6/execution";

import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { PersonalTokenGenerator } from "../../../../../token-generator.js";
import { GetConnections } from "../../../../building-blocks/authorization/connections/index.js";
import { getClients, getTokenOpts } from "../common-functions.js";

export { setup } from "../common-functions.js";

// Labels for different actions
const getRightholdersToLabel = { step: "Get rightholders to" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

// get k6 options
export const options = getOptions([getRightholdersToLabel, tokenGeneratorLabel]);

/**
 * Main function executed by each VU.
 *
 * @param testData TODO: description
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
