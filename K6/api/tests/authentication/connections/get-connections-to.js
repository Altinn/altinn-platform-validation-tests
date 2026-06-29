import exec from "k6/execution";

import { getItemFromList, getOptions } from "../../../../helpers.js";
import { PersonalTokenGenerator } from "../../../../token-generator.js";
import { GetConnections } from "../../../building-blocks/authentication/connections/index.js";
import { getClients, getTokenOpts } from "./common-functions.js";

export { setup } from "./common-functions.js";

// Labels for different actions
const getConnectionsToLabel = { step: "Get connections to" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

// get k6 options
export const options = getOptions([getConnectionsToLabel, tokenGeneratorLabel]);

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
    GetConnections(
        connectionsApiClient,
        queryParamsTo,
        getConnectionsToLabel
    );
}
