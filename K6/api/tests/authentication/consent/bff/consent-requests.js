/**
 * This test is designed to retrieve the active consent for a user in a more realistic scenario, where the users are randomly selected from a larger pool of users.
 */
import exec from "k6/execution";
import { GetActiveConsent } from "../../../../building-blocks/authentication/client-delegations/index.js";
import { randomItem } from "../../../../../common-imports.js";
import { getOptions } from "../../../../../helpers.js";
import { getTokenOpts } from "../../access-management/bff/commons.js";
import { getClients } from "./commons.js";
export { setup } from "./commons.js";

const getActiveConsentLabel = { step: "Get active consent for user" };

export const options = getOptions([getActiveConsentLabel],);

/*
 * The default function for the K6 test, which retrieves the active consent for a user.
 * This function is executed for each iteration of the test, and it uses a predefined set of users to simulate the retrieval process.
 * For each iteration, it randomly selects a user from the predefined list, generates a token for that user, and then calls the GetActiveConsent function to retrieve the active consent.
 */
export default function (data) {
    const [accessManagementApiClient, tokenGenerator] = getClients();
    const from = randomItem(data[exec.vu.idInTest - 1]);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));
    GetActiveConsent(accessManagementApiClient, from.partyUuid, getActiveConsentLabel);
}
