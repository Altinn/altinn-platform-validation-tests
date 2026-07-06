import exec from "k6/execution";

import { getItemFromList, getOptions } from "../../../../helpers.js";
import { PersonalTokenGenerator } from "../../../../token-generator.js";
import { GetAccessPackages } from "../../../building-blocks/authorization/connections/index.js";
import { getClients, getTokenOpts } from "./common-functions.js";

export { setup } from "./common-functions.js";

// Labels for different actions
const getAccessPackagesFromLabel = { step: "Get accesspackages from" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

// get k6 options
export const options = getOptions([getAccessPackagesFromLabel, tokenGeneratorLabel]);

/**
 * Main function executed by each VU.
 */
export default function (testData) {
    const [connectionsApiClient, tokenGenerator] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.userId));

    const queryParamsFrom = {
        party: party.orgUuid,
        from: party.orgUuid
    };

    GetAccessPackages(
        connectionsApiClient,
        queryParamsFrom,
        getAccessPackagesFromLabel
    );
}
