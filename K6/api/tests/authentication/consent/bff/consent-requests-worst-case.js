/**
 * Worst case scenario for consent requests: all users have an active consent request, and we fetch the active consent for each of them.
 */
import { GetActiveConsent } from "../../../../building-blocks/authentication/client-delegations/index.js";
import { getOptions } from "../../../../../helpers.js";
import { getTokenOpts } from "../../access-management/bff/commons.js";
import { worst_case_users as users, getClients } from "./commons.js";

export const options = getOptions(users.map(user => user.label));

/**
 * The default function for the K6 test, which retrieves the active consent for a user in a worst-case scenario.
 * This function is executed for each iteration of the test, and it uses a predefined set of users to simulate the retrieval process.
 * For each iteration, it selects a user from the predefined list, generates a token for that user, and then calls the GetActiveConsent function to retrieve the active consent.
 */
export default function () {
    const [accessManagementApiClient, tokenGenerator] = getClients();
    const from = users[__ITER % users.length];
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));
    GetActiveConsent(accessManagementApiClient, from.partyUuid, from.label);
}
