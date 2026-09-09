import { fail, group } from "k6";

import { getItemFromList } from "../../../../helpers.js";
import { CreateRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-imports.js";
import { createSystemRegistration, getClients, getVendorTokenOpts, resourceRight, sweepSystems } from "./commons.js";

/**
 * The resource the requested system user is asked for. Published in every
 * environment these tests run in.
 */
const RESOURCE = "k6-instancedelegation-test";

/**
 * What this test names its systems, which is also what its teardown sweeps up.
 * Unique per test, or two tests running at once would delete each other's systems.
 */
const SYSTEM_NAME_PREFIX = "requestdelete";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

export { setup } from "./commons.js";

/**
 * Test: a vendor can withdraw a system user request the customer never approved.
 *
 * create-and-confirm-system-user-request.js covers the happy path through
 * approval. What is left, and what this covers, is finding the request by its
 * external ref and deleting it again. Without it every run leaves a pending
 * request on the customer, which is what issue #432 pointed out.
 *
 * The system is removed from the register at the end, so a run leaves nothing
 * behind but the metrics.
 *
 * @param {ReturnType<typeof import("./commons.js").setup>} data The customers and the vendor from setup.
 */
export default function (data) {
    const { clients, vendorTokenGenerator } = getClients();
    const customer = getItemFromList(data.customers, randomize);

    const rights = [resourceRight(RESOURCE)];

    const registration = createSystemRegistration({
        systemNamePrefix: SYSTEM_NAME_PREFIX,
        vendorOrgNo: data.vendorOrgNo,
        registeredRights: rights,
    });

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(registration.systemOwner));

    group("As a vendor, I can find a system user request by external ref and withdraw it", function () {
        group("Register the system the request is made for", function () {
            const createdSystemId = SystemRegisterBuildingBlocks.VendorCreate(clients.vendor.systemRegisterClient, registration.registerSystemRequest);

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

        group("Find the request by its external ref", function () {
            const request = RequestSystemUserBuildingBlocks.VendorGetByExternalRef(
                clients.vendor.requestSystemUserClient,
                registration.systemId,
                customer.orgNo,
                registration.externalRef,
            );

            SystemUserRequestDomainChecks.CheckSameRequest(request, requestId);
        });

        group("Withdraw the request", function () {
            if (!SystemUserRequestDomainChecks.CheckRequestId(requestId)) {
                fail("cannot withdraw: creating the system user request returned no id");
            }

            const deleted = RequestSystemUserBuildingBlocks.VendorDelete(clients.vendor.requestSystemUserClient, requestId);

            SystemUserRequestDomainChecks.CheckRequestDeleted(deleted);
        });

        group("Remove the system from the register", function () {
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
