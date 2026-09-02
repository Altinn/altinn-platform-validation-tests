import { fail, group } from "k6";

import { getItemFromList } from "../../../../helpers.js";
import { CreateRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-imports.js";
import { DeleteSystemUser } from "../../../building-blocks/access-management-bff/system-user/index.js";
import { ApproveSystemUserRequest } from "../../../building-blocks/access-management-bff/system-user-request/index.js";
import { createSystemRegistration, getApproverTokenOpts, getClients, getVendorTokenOpts, resourceRight, sweepSystems } from "./commons.js";

/**
 * The resource the requested system user is asked for.
 *
 * Published and delegable in every environment this test runs in. The resource it
 * used to name, ttd-dialogporten-performance-test-01, is not published in at23 and
 * not delegable in yt01, so the test could only ever run in at22.
 */
const RESOURCE = "k6-instancedelegation-test";

/**
 * The Altinn app the requested system user is also asked for.
 *
 * An app is a resource like any other as far as the request payload goes, only with
 * an identifier of the form app_<org>_<app>, and it is the case a vendor integrating
 * against an app service actually makes. It went untested here until now, so a
 * regression that only hit app rights would have gone unnoticed.
 *
 * Which app it is takes some care, since this test runs in all four environments and
 * the customer's approval runs a delegation check: app_ttd_endring-av-navn-v2, which
 * the authentication repo uses, is not published in yt01, and app_ttd_martinotest is
 * published everywhere but not delegable in tt02, where approving it answers 403
 * ResourceNotDelegable. This one is published and delegable in all four.
 */
const APP = "app_ttd_two-task-app";

/**
 * What this test names its systems, which is also what its teardown sweeps up.
 * Unique per test, or two tests running at once would delete each other's systems.
 */
const SYSTEM_NAME_PREFIX = "perftest";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

export { setup } from "./commons.js";

/**
 * @param {ReturnType<typeof import("./commons.js").setup>} data Test data from setup.
 */
export default function (data) {
    const [clients, approverTokenGenerator, vendorTokenGenerator] = getClients();
    const customer = getItemFromList(data.customers, randomize);

    const rights = [resourceRight(RESOURCE), resourceRight(APP)];

    const registration = createSystemRegistration({
        systemNamePrefix: SYSTEM_NAME_PREFIX,
        vendorOrgNo: data.vendorOrgNo,
        registeredRights: rights,
    });

    // The registration drew the vendor, so both tokens are set for who this
    // iteration acts as before the first call goes out.
    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(registration.systemOwner));
    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(customer));

    group("As a vendor, I can request a system user and have the customer approve it", function () {
        group("Register the system the request is made for", function () {
            const createdSystemId = SystemRegisterBuildingBlocks.VendorCreate(clients.vendor.systemRegisterClient, registration.registerSystemRequest);

            // A system user request against a system that was never registered is
            // rejected, so the rest of the test would only measure that.
            if (createdSystemId === null) {
                fail("cannot request a system user: registering the system did not return a system id");
            }
        });

        const requestId = group("Create the system user request", function () {
            const createRequest = new CreateRequestSystemUserBuilder()
                .withExternalRef(registration.externalRef)
                .withSystemId(registration.systemId)
                .withPartyOrgNo(customer.orgNo)
                .withRights(rights)
                .withRedirectUrl(registration.redirectUrl)
                .build();

            const createdRequest = RequestSystemUserBuildingBlocks.VendorCreate(clients.vendor.requestSystemUserClient, createRequest);

            SystemUserRequestDomainChecks.CheckRequestCreated(createdRequest, {
                systemId: registration.systemId,
                partyOrgNo: customer.orgNo,
                externalRef: registration.externalRef,
            });

            return createdRequest?.id;
        });

        group("Approve the request as the customer", function () {
            if (!SystemUserRequestDomainChecks.CheckRequestId(requestId)) {
                fail("cannot approve: creating the system user request returned no id");
            }

            const approved = ApproveSystemUserRequest(
                clients.approver.bffRequestClient,
                customer.partyId,
                requestId,
            );

            SystemUserRequestDomainChecks.CheckRequestApproved(approved);
        });

        group("The approved request is accepted", function () {
            if (!SystemUserRequestDomainChecks.CheckRequestId(requestId)) {
                fail("cannot check the status: creating the system user request returned no id");
            }

            const request = RequestSystemUserBuildingBlocks.VendorGet(clients.vendor.requestSystemUserClient, requestId);

            SystemUserRequestDomainChecks.CheckRequestStatus(request, "Accepted");
        });

        // Every iteration makes a system user and a system of its own, so the cleanup
        // belongs here rather than in a teardown. Without it a scheduled run leaves
        // both behind every fifteen minutes, which is where the piles of stale system
        // users in the test environments came from.
        group("Cleanup - the customer deletes the system user and the vendor its system", function () {
            const systemUser = SystemUserBuildingBlocks.GetByExternalId(clients.vendor.systemUserClient, {
                clientId: registration.clientId,
                systemProviderOrgNo: registration.systemOwner,
                systemUserOwnerOrgNo: customer.orgNo,
                externalRef: registration.externalRef,
            });

            if (systemUser?.id !== undefined && systemUser.id !== null) {
                DeleteSystemUser(clients.approver.bffSystemUserClient, customer.partyId, systemUser.id);
            }

            SystemRegisterBuildingBlocks.VendorDelete(clients.vendor.systemRegisterClient, registration.systemId);
        });
    });
}

/**
 * k6 teardown stage. Removes the systems this test left in the register.
 *
 * Every iteration registers a system and deletes it again, so on the way it was
 * meant to go there is nothing here to do. An iteration that gave up half way is
 * what this is for: fail() skips the delete, and the system would stay behind.
 *
 * @param {ReturnType<typeof import("./commons.js").setup>} data The customers and the vendor from setup.
 */
export function teardown(data) {
    sweepSystems(data.vendorOrgNo, SYSTEM_NAME_PREFIX);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
