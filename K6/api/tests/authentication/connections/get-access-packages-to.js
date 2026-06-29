import { GetAccessPackages } from "../../../building-blocks/authentication/connections/index.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { getClients, getTokenOpts } from "./common-functions.js";
import exec from "k6/execution";
export { setup } from "./common-functions.js";
import { PersonalTokenGenerator } from "../../../../token-generator.js";

// Labels for different actions
const getAccessPackagesToLabel = { step: "Get accesspackages to" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

// get k6 options
export const options = getOptions([getAccessPackagesToLabel, tokenGeneratorLabel]);

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
        getAccessPackagesToLabel
    );
}
