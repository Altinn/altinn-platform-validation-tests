import { fail, group } from "k6";

import { Right } from "../../../../clients/authentication/types.js";
import { uuidv4 } from "../../../../common-imports.js";
import { getItemFromList } from "../../../../helpers.js";
import { ChangeRequestSystemUserBuilder, ChangeRequestSystemUserBuildingBlocks, ChangeRequestSystemUserDomainChecks } from "../../../authentication-imports.js";
import { arrangeApprovedSystemUser, cleanupArranged, getClients, getVendorTokenOpts, pickVendor, REDIRECT_URL, resource } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The rights the system user starts with.
 *
 * @type {Right[]}
 */
const GRANTED_RIGHTS = [resource("k6-instancedelegation-test")];

/**
 * The rights the change request asks for, which the system user does not have.
 *
 * @type {Right[]}
 */
const REQUESTED_RIGHTS = [resource("ttd-dialogporten-dummy")];

/**
 * k6 setup stage. Arranges the system user the change requests are made for.
 *
 * @returns The system user to change, as a single item list.
 */
export function setup() {
    const vendorOrgNo = pickVendor();

    return arrangeApprovedSystemUser({
        systemNamePrefix: "changerequestdelete",
        vendorOrgNo,
        grantedRights: GRANTED_RIGHTS,
        registeredRights: [...GRANTED_RIGHTS, ...REQUESTED_RIGHTS],
    });
}

/**
 * Test: a vendor can withdraw a change request it no longer needs.
 *
 * The create flow and the approval are covered by
 * create-and-approve-change-request.js. What is left, and what this covers, is
 * finding the change request by the external ref the system user carries and
 * deleting it again. Without this every run leaves a pending change request on the
 * customer.
 *
 * @param {any[]} data The arranged system users from setup.
 */
export default function (data) {
    const systemUser = getItemFromList(data, randomize);
    const [clients, , vendorTokenGenerator] = getClients();

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(systemUser.vendorOrgNo));

    group("As a vendor, I can find a change request by external ref and withdraw it", function () {
        const changeRequestId = group("Ask for a right the system user does not have", function () {
            const request = new ChangeRequestSystemUserBuilder()
                .withRequiredRights(REQUESTED_RIGHTS)
                .withRedirectUrl(REDIRECT_URL)
                .build();

            const changeRequest = ChangeRequestSystemUserBuildingBlocks.VendorCreate(
                clients.vendor.changeRequestClient,
                request,
                uuidv4(),
                systemUser.systemUserId,
                201,
            );

            return changeRequest?.id;
        });

        group("Find the change request by the external ref the system user carries", function () {
            // A change request has no external ref of its own, it inherits the one
            // the system user was created with.
            const changeRequest = ChangeRequestSystemUserBuildingBlocks.VendorGetByExternalRef(
                clients.vendor.changeRequestClient,
                systemUser.systemId,
                systemUser.customer.orgNo,
                systemUser.externalRef,
            );

            ChangeRequestSystemUserDomainChecks.CheckSameChangeRequest(changeRequest, changeRequestId);
        });

        group("Withdraw the change request", function () {
            if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestId(changeRequestId)) {
                fail("cannot withdraw: no change request was created to withdraw");
            }

            const deleted = ChangeRequestSystemUserBuildingBlocks.VendorDelete(clients.vendor.changeRequestClient, changeRequestId);

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestDeleted(deleted);
        });
    });
}

/**
 * k6 teardown stage. Deletes the system user this test made change requests for
 * and the system it belongs to.
 *
 * @param {any[]} data The arranged system users from setup.
 */
export function teardown(data) {
    cleanupArranged(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
