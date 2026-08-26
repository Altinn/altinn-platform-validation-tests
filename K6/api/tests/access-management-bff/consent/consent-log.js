import exec from "k6/execution";

import { randomItem } from "../../../../common-imports.js";
import { getOptions } from "../../../../helpers.js";
import { GetConsentLog } from "../../../building-blocks/access-management-bff/consent/index.js";
import { ConsentDomainChecks } from "../../../domain-checks/access-management/consent.js";
import { getClients, getTokenOpts } from "./commons.js";

export { setup } from "./commons.js";

const getConsentLogLabel = { step: "Get consent log for user" };

export const options = getOptions([getConsentLogLabel]);

/**
 * Test: reading the consent log as a user drawn from the whole pool.
 *
 * The realistic counterpart to consent-log-worst-case.js, which reads as the users
 * with the most consent requests. Here the user is drawn at random from this VU's
 * slice, so the numbers say what the endpoint costs for an ordinary user.
 *
 * @param {any[][]} data Users, one slice per VU.
 */
export default function (data) {
    const [consentClient, tokenGenerator] = getClients();

    const from = randomItem(data[exec.vu.idInTest - 1]);

    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    const log = GetConsentLog(consentClient, from.partyUuid, getConsentLogLabel);

    ConsentDomainChecks.CheckConsentResponse(log, "GetConsentLog");
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
