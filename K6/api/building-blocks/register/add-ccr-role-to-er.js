import { check } from "k6";

import { EnhetsregisteretClient } from "../../../clients/register/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Assigns a role in ER, making the facilitator organization the revisor,
 * regnskapsfører or forretningsfører of the client organization.
 *
 * ER answers with a batch report rather than an entity, and reports the outcome
 * of the batch inside a 200 response, so the status code alone says nothing.
 *
 * @param {EnhetsregisteretClient} enhetsregisteretClient Client for the ER update service.
 * @param {string} soapErUsername ER system user name.
 * @param {string} soapErPassword ER system user password.
 * @param {string} ccrRole The role to assign, keyed as in ErRoleFieldTypes.
 * @param {string} clientOrg Organization number of the organization getting a facilitator.
 * @param {string} facilitatorOrg Organization number of the facilitator.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether ER processed the batch.
 */
export function AddCcrRoleToEr(
    enhetsregisteretClient,
    soapErUsername,
    soapErPassword,
    ccrRole,
    clientOrg,
    facilitatorOrg,
    labels = null,
) {
    const res = withRetries(
        () =>
            enhetsregisteretClient.AddCcrRole(
                soapErUsername,
                soapErPassword,
                ccrRole,
                clientOrg,
                facilitatorOrg,
                labels,
            ),
        `AddCcrRoleToEr(${ccrRole})`,
    );

    const succeed = check(res, {
        [`AddCcrRoleToEr(${ccrRole}) - status code is 200`]: (r) =>
            r.status === 200,
        [`AddCcrRoleToEr(${ccrRole}) - batch status is OK_ER_DATA_PROCESSED`]: (r) =>
            typeof r.body === "string" &&
            r.body.includes("status=\"OK_ER_DATA_PROCESSED\""),
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
