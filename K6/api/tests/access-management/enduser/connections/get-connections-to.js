import exec from "k6/execution";

import { GetConnectionsQueryBuilder } from "../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { PersonalTokenGenerator } from "../../../../../token-generator.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { getClients, getTokenOpts } from "./common-functions.js";

export { setup } from "./common-functions.js";

// Labels for different actions
const getConnectionsToLabel = { step: "Get connections to" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

// get k6 options
export const options = getOptions([getConnectionsToLabel, tokenGeneratorLabel]);

/**
 * Main function executed by each VU.
 *
 * @param {object[][]} testData Organizations with a party uuid, one slice per VU.
 */
export default function (testData) {
    const [connectionsApiClient, tokenGenerator] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.userId));
    const queryParamsTo = new GetConnectionsQueryBuilder()
        .withParty(party.orgUuid)
        .withTo(party.orgUuid)
        .build();
    EndUserBuildingBlocks.Connections.GetConnections(
        connectionsApiClient,
        queryParamsTo,
        null,
        getConnectionsToLabel
    );
}
