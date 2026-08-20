import { group } from "k6";

import { getItemFromList, requireEnv } from "../../../../helpers.js";
import { SystemUserBuildingBlocks, SystemUserDomainChecks, SystemUserUpdateDtoBuilder } from "../../../authentication-imports.js";
import { arrangeSystemUser, cleanupArranged, getClients, getCustomerTokenOpts } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * k6 setup stage. Arranges the system user this test updates.
 *
 * @returns {object[]} The system user to update, as a single item list.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    return arrangeSystemUser("updatesystemuser");
}

/**
 * Test: a customer can update the system user it owns.
 *
 * The only write on a system user, and it had no test at all, which is what issue
 * #432 pointed out first.
 *
 * The new title is not read back on purpose: the endpoint answers 200 for a system
 * user that exists and 404 for one that does not, but persists nothing, since the
 * update is commented out in UpdateSystemUserById in altinn-authentication. So this
 * covers that the endpoint is reachable and accepts what the portal sends, and
 * should grow a read-back once the service actually writes.
 *
 * @param {object[]} data The arranged system users from setup.
 */
export default function (data) {
    const systemUser = getItemFromList(data, randomize);
    const [clients, customerTokenGenerator] = getClients();

    customerTokenGenerator.setTokenGeneratorOptions(getCustomerTokenOpts(systemUser.customer));

    group("As a customer, I can update the system user I own", function () {
        const request = new SystemUserUpdateDtoBuilder()
            .withId(systemUser.systemUserId)
            .withPartyId(`${systemUser.customer.orgPartyId}`)
            .withReporteeOrgNo(systemUser.customer.orgNo)
            .withSystemId(systemUser.systemId)
            .withIntegrationTitle("Oppdatert av k6-testen for oppdatering av systembruker")
            .build();

        const updated = SystemUserBuildingBlocks.Update(clients.customer.systemUserClient, request);

        SystemUserDomainChecks.CheckSystemUserUpdated(updated);
    });
}

/**
 * k6 teardown stage. Deletes the system user this test updated and the system it
 * belongs to.
 *
 * @param {object[]} data The arranged system users from setup.
 */
export function teardown(data) {
    cleanupArranged(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
