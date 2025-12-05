import { GetAccessPackages } from "../../../building-blocks/auth/connections/index.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { getClients, getTokenOpts } from "./common-functions.js";
import exec from "k6/execution";
export { setup } from "./common-functions.js";

// Labels for different actions
const getAccessPackagesFromLabel = "Get accesspackages from";
const tokenGeneratorLabel = "Personal Token Generator";

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
