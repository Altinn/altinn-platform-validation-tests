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
 * PUT /systemuser is the only write on a system user, and it had no test at all,
 * which is what issue #432 pointed out first. Parked rather than scheduled: the
 * endpoint answers 500 for every caller, so there is nothing a test can do to make
 * it pass. It is left out of functional.yaml and out of both run-all files, and
 * belongs back in both the day the endpoint works.
 *
 * Two things are wrong with it in altinn-authentication, both in SystemUserController.
 *
 * The action is [HttpPut] with no route parameters, behind a PEP policy that builds
 * its decision request from route data. With no {party} to read, the authorization
 * handler throws a NullReferenceException in DecisionHelper.CreateDecisionRequest
 * before the action runs, so every token shape gets 500: end user, vendor and system
 * user owner alike. Its DELETE sibling takes {party}/{systemUserId} in the route,
 * which is where that party is supposed to come from.
 *
 * Past that, UpdateSystemUserById persists nothing either. The call to the service
 * is commented out, so the update would answer 200 without changing the title.
 *
 * So the title is not read back here either. Add that once the service writes.
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
