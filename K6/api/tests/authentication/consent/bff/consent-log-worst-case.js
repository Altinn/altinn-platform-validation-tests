/*
 * This test is designed to simulate a worst-case scenario for the consent log retrieval process.
 */
import { GetConsentLog } from "../../../../building-blocks/authentication/client-delegations/index.js";
import { getOptions } from "../../../../../helpers.js";
import { worst_case_users as users, getClients, getTokenOpts } from "./commons.js";

export const options = getOptions(users.map(user => { return { unique_id: user.label }; }));

/**
 * The default function for the K6 test, which retrieves the consent log for a user in a worst-case scenario.
 * This function is executed for each iteration of the test, and it uses a predefined set of users to simulate the retrieval process.
 * For each iteration, it selects a user from the predefined list, generates a token for that user, and then calls the GetConsentLog function to retrieve the consent log.
 */
export default function () {
    const [accessManagementApiClient, tokenGenerator] = getClients();
    const from = users[__ITER % users.length];
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));
    GetConsentLog(accessManagementApiClient, from.partyUuid, from.label);
}
