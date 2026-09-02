import { group } from "k6";

import { getItemFromList, requireEnv } from "../../../../helpers.js";
import { SystemUserBuildingBlocks, SystemUserDomainChecks } from "../../../authentication-imports.js";
import { arrangeSystemUser, cleanupArranged, getClients, getVendorTokenOpts } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * k6 setup stage. Arranges the system user this test looks up.
 *
 * @returns The system user to look up, as a single item list.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    return arrangeSystemUser("systemuserbyquery");
}

/**
 * Test: a vendor can find one of its system users by query and by external id.
 *
 * Both lookups take the same three identifiers the vendor already holds, and both
 * only return system users belonging to the vendor in the token, so they are what a
 * vendor uses to find the system user a customer just approved.
 *
 * @param {ReturnType<typeof setup>} data The arranged system users from setup.
 */
export default function (data) {
    const systemUser = getItemFromList(data, randomize);
    const { clients, vendorTokenGenerator } = getClients();

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(systemUser.vendorOrgNo));

    const expected = { id: systemUser.systemUserId, systemId: systemUser.systemId };

    group("As a vendor, I can find my system user by query and by external id", function () {
        group("Find the system user by query", function () {
            const found = SystemUserBuildingBlocks.VendorGetByQuery(clients.vendor.systemUserClient, {
                "system-id": systemUser.systemId,
                "external-ref": systemUser.externalRef,
                orgno: systemUser.customer.orgNo,
            });

            SystemUserDomainChecks.CheckSystemUserFound(found, expected, "VendorGetByQuery");
        });

        group("Find the system user by external id", function () {
            const found = SystemUserBuildingBlocks.GetByExternalId(clients.vendor.systemUserClient, {
                clientId: systemUser.clientId,
                systemProviderOrgNo: systemUser.vendorOrgNo,
                systemUserOwnerOrgNo: systemUser.customer.orgNo,
                externalRef: systemUser.externalRef,
            });

            SystemUserDomainChecks.CheckSystemUserFound(found, expected, "GetByExternalId");
        });
    });
}

/**
 * k6 teardown stage. Deletes the system user this test looked up and the system it
 * belongs to.
 *
 * @param {ReturnType<typeof setup>} data The arranged system users from setup.
 */
export function teardown(data) {
    cleanupArranged(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
