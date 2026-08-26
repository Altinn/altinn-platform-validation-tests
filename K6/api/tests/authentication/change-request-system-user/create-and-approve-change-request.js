import { fail, group } from "k6";

import { Right } from "../../../../clients/authentication/types.js";
import { uuidv4 } from "../../../../common-imports.js";
import { getItemFromList } from "../../../../helpers.js";
import { ChangeRequestSystemUserBuilder, ChangeRequestSystemUserBuildingBlocks, ChangeRequestSystemUserDomainChecks } from "../../../authentication-imports.js";
import { ApproveChangeRequest } from "../../../building-blocks/access-management-bff/system-user-change-request/index.js";
import { accessPackage, arrangeApprovedSystemUser, cleanupArranged, findAccessPackages, getApproverTokenOpts, getClients, getVendorTokenOpts, pickVendor, REDIRECT_URL, resource } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The rights the system user starts with.
 *
 * Both resources here are published in every environment the test runs in. The
 * ones this test used to name were not: ttd-dialogporten-performance-test-01 is
 * missing in at23 and authentication-e2e-test in yt01, so registering the system
 * would have failed there.
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
 * k6 setup stage. Arranges the system user this test changes.
 *
 * The system is registered with both sets, so the system user starts with the
 * granted rights and the change request has something left to ask for.
 *
 * @returns The system user to change, as a single item list.
 */
export function setup() {
    // Drawn once here rather than per iteration, since the system belongs to the
    // vendor that registered it and every iteration acts on that same system.
    const vendorOrgNo = pickVendor();

    // Two packages, so the change request can give one up and ask for the other.
    const [grantedPackage, requestedPackage] = findAccessPackages(2, vendorOrgNo);

    return arrangeApprovedSystemUser({
        systemNamePrefix: "changerequestapprove",
        vendorOrgNo,
        grantedRights: GRANTED_RIGHTS,
        registeredRights: [...GRANTED_RIGHTS, ...REQUESTED_RIGHTS],
        grantedAccessPackages: [grantedPackage],
        registeredAccessPackages: [grantedPackage, requestedPackage],
    });
}

/**
 * Test: a vendor can ask for more rights on an existing system user.
 *
 * @param {ReturnType<typeof setup>} data The arranged system users from setup.
 */
export default function (data) {
    const systemUser = getItemFromList(data, randomize);
    const [clients, approverTokenGenerator, vendorTokenGenerator] = getClients();

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(systemUser.vendorOrgNo));
    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(systemUser.customer));

    // The system user has the first package and not the second, so the change request
    // gives up what it has and asks for what it does not.
    const removedAccessPackages = systemUser.grantedAccessPackages.map(accessPackage);
    const addedAccessPackages = systemUser.registeredAccessPackages
        .filter((urn) => !systemUser.grantedAccessPackages.includes(urn))
        .map(accessPackage);

    // The arrange hands back a system user id only when every step of it worked,
    // rather than failing the run, so that its teardown gets to remove what it did
    // create. Nothing below says anything without one.
    if (!ChangeRequestSystemUserDomainChecks.CheckSystemUserToChange(systemUser.systemUserId)) {
        fail("cannot ask for more rights: the setup produced no system user");
    }

    // Bound after the guard, so the groups below read a value the compiler knows is
    // there rather than one narrowed outside their own scope.
    const systemUserId = systemUser.systemUserId;

    group("As a vendor, I can ask an existing system user for more rights", function () {
        const correlationId = uuidv4();

        const changeRequestId = group("Ask for a right the system user does not have", function () {

            const request = new ChangeRequestSystemUserBuilder()
                .withRequiredRights(REQUESTED_RIGHTS)
                .withRequiredAccessPackages(addedAccessPackages)
                .withUnwantedAccessPackages(removedAccessPackages)
                .withRedirectUrl(REDIRECT_URL)
                .build();

            const changeRequestResponse = ChangeRequestSystemUserBuildingBlocks.VendorCreate(
                clients.vendor.changeRequestClient,
                request,
                correlationId,
                systemUserId,
                201,
            );

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestSystemUserId(changeRequestResponse, systemUserId);
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestConfirmUrl(changeRequestResponse);
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestRequiredRights(changeRequestResponse, REQUESTED_RIGHTS);
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestRequiredAccessPackages(changeRequestResponse, addedAccessPackages);
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestUnwantedAccessPackages(changeRequestResponse, removedAccessPackages);

            return changeRequestResponse?.id;
        });

        group("Asking again with the same correlation id returns the same change request", function () {
            if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestId(changeRequestId)) {
                fail("cannot ask again with the same correlation id: the first change request returned no id to compare against");
            }

            const request = new ChangeRequestSystemUserBuilder()
                .withRequiredRights(REQUESTED_RIGHTS)
                .withRequiredAccessPackages(addedAccessPackages)
                .withUnwantedAccessPackages(removedAccessPackages)
                .withRedirectUrl(REDIRECT_URL)
                .build();

            const changeRequest = ChangeRequestSystemUserBuildingBlocks.VendorCreate(
                clients.vendor.changeRequestClient,
                request,
                correlationId,
                systemUserId,
                200,
            );

            ChangeRequestSystemUserDomainChecks.CheckSameChangeRequest(changeRequest, changeRequestId);
        });

        group("The customer approves the change", function () {
            if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestId(changeRequestId)) {
                fail("cannot approve: no change request was created to approve");
            }

            const approved = ApproveChangeRequest(
                clients.approver.bffChangeRequestClient,
                systemUser.customer.orgPartyId,
                changeRequestId,
            );

            // Reading the status back only says something about the change request
            // if it was approved. Without this, an approve that failed shows up as
            // a status that is still New, which reads as a second, unrelated failure.
            if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestApproved(approved)) {
                fail("cannot check the status: approving the change request failed");
            }

            const changeRequest = ChangeRequestSystemUserBuildingBlocks.VendorGet(clients.vendor.changeRequestClient, changeRequestId);

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestStatus(changeRequest, "Accepted");
        });
    });
}

/**
 * k6 teardown stage. Deletes the system user this test changed and the system
 * it belongs to.
 *
 * Every iteration shares the one system user setup arranged, so neither can be
 * deleted from the test itself without pulling them out from under the
 * iterations that follow.
 *
 * @param {ReturnType<typeof setup>} data The arranged system users from setup.
 */
export function teardown(data) {
    cleanupArranged(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
