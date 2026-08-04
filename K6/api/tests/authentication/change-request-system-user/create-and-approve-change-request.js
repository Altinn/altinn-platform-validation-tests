import { fail, group } from "k6";

import { uuidv4 } from "../../../../common-imports.js";
import { getItemFromList } from "../../../../helpers.js";
import { ChangeRequestSystemUserBuilder, ChangeRequestSystemUserBuildingBlocks, ChangeRequestSystemUserDomainChecks } from "../../../authentication-v2-imports.js";
import { ApproveChangeRequest } from "../../../building-blocks/access-management-bff/system-user-change-request/index.js";
import { accessPackage, arrangeApprovedSystemUser, findAccessPackages, getApproverTokenOpts, getClients, REDIRECT_URL, resource } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The rights the system user starts with.
 *
 * @type {Right[]}
 */
const GRANTED_RIGHTS = [resource("ttd-dialogporten-performance-test-01")];

/**
 * The rights the change request asks for, which the system user does not have.
 *
 * @type {Right[]}
 */
const REQUESTED_RIGHTS = [resource("authentication-e2e-test")];

/**
 * k6 setup stage. Arranges the system user this test changes.
 *
 * The system is registered with both sets, so the system user starts with the
 * granted rights and the change request has something left to ask for.
 *
 * @returns {object[]} The system user to change, as a single item list.
 */
export function setup() {
    // Two packages, so the change request can give one up and ask for the other.
    const [grantedPackage, requestedPackage] = findAccessPackages(2);

    return arrangeApprovedSystemUser({
        systemNamePrefix: "changerequest",
        grantedRights: GRANTED_RIGHTS,
        registeredRights: [...GRANTED_RIGHTS, ...REQUESTED_RIGHTS],
        grantedAccessPackages: [grantedPackage],
        registeredAccessPackages: [grantedPackage, requestedPackage],
    });
}

/**
 * Test: a vendor can ask for more rights on an existing system user.
 *
 * @param {object[]} data The arranged system users from setup.
 */
export default function (data) {
    const [clients, approverTokenGenerator] = getClients();
    const systemUser = getItemFromList(data, randomize);

    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(systemUser.customer));

    // The system user has the first package and not the second, so the change request
    // gives up what it has and asks for what it does not.
    const removedAccessPackages = systemUser.grantedAccessPackages.map(accessPackage);
    const addedAccessPackages = systemUser.registeredAccessPackages
        .filter((urn) => !systemUser.grantedAccessPackages.includes(urn))
        .map(accessPackage);

    group("As a vendor, I can ask an existing system user for more rights", function () {
        let changeRequestId;
        const correlationId = uuidv4();

        group("Ask for a right the system user does not have", function () {

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
                systemUser.systemUserId,
                201,
            );

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestSystemUserId(changeRequestResponse, systemUser.systemUserId);
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestConfirmUrl(changeRequestResponse);
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestRequiredRights(changeRequestResponse, REQUESTED_RIGHTS);
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestRequiredAccessPackages(changeRequestResponse, addedAccessPackages);
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestUnwantedAccessPackages(changeRequestResponse, removedAccessPackages);

            changeRequestId = changeRequestResponse?.id;
        });

        group("Asking again with the same correlation id returns the same change request", function () {
            if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestId(changeRequestId)) {
                fail("missing prerequisite: a change request was created to ask for again");
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
                systemUser.systemUserId,
                200,
            );

            ChangeRequestSystemUserDomainChecks.CheckSameChangeRequest(changeRequest, changeRequestId);
        });

        group("The customer approves the change", function () {
            if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestId(changeRequestId)) {
                fail("A change request must be created to approve");
            }

            const approved = ApproveChangeRequest(
                clients.approver.bffChangeRequestClient,
                systemUser.customer.partyId,
                changeRequestId,
            );

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestApproved(approved);

            const changeRequest = ChangeRequestSystemUserBuildingBlocks.VendorGet(clients.vendor.changeRequestClient, changeRequestId);

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestStatus(changeRequest, "Accepted");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
