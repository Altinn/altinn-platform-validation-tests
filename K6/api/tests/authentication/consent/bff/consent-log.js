/**
 * This test is designed to retrieve the consent log for a user in a more realistic scenario, where the users are randomly selected from a larger pool of users.
 */
import exec from "k6/execution";
import { GetConsentLog } from "../../../../building-blocks/authentication/client-delegations/index.js";
import { randomItem } from "../../../../../common-imports.js";
import { getOptions } from "../../../../../helpers.js";
import { getClients, getTokenOpts } from "./commons.js";
export { setup } from "./commons.js";

const getConsentLogLabel = "Get consent log for user";

export const options = getOptions([getConsentLogLabel],);

/*
* The default function for the K6 test, which retrieves the consent log for a user.
* This function is executed for each iteration of the test, and it uses a predefined set of users to simulate the retrieval process.
* For each iteration, it randomly selects a user from the predefined list, generates a token for that user, and then calls the GetConsentLog function to retrieve the consent log.
*/
export default function (data) {
    const [accessManagementApiClient, tokenGenerator] = getClients();
    const from = randomItem(data[exec.vu.idInTest - 1]);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));
    GetConsentLog(accessManagementApiClient, from.partyUuid, getConsentLogLabel);
}
