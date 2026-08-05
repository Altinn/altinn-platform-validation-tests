import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetActiveConsents } from "../../../building-blocks/access-management-bff/consent/index.js";
import { ConsentDomainChecks } from "../../../domain-checks/access-management/consent.js";
import { getClients, getTokenOpts, worst_case_users as users } from "./commons.js";

// One threshold per user, so the summary breaks the numbers out per user rather
// than averaging the heaviest one away.
export const options = getOptions(users.map(user => { return { unique_id: user.label }; }));

/**
 * Test: reading the active consents as the users that have the most consent
 * requests.
 *
 * The users are walked in order rather than drawn at random, so every one of them
 * is read the same number of times and their numbers stay comparable.
 */
export default function () {
    const [consentClient, tokenGenerator] = getClients();

    const from = getItemFromList(users);

    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    const activeConsents = GetActiveConsents(consentClient, from.partyUuid, { unique_id: from.label });

    ConsentDomainChecks.CheckConsentResponse(activeConsents, "GetActiveConsents");
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
