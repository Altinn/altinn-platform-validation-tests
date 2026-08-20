import { fail, group } from "k6";

import { getItemFromList } from "../../../../helpers.js";
import { CreateRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-imports.js";
import { DeleteSystemUser } from "../../../building-blocks/access-management-bff/system-user/index.js";
import { ApproveSystemUserRequest } from "../../../building-blocks/access-management-bff/system-user-request/index.js";
import { createSystemRegistration, getApproverTokenOpts, getClients, getVendorTokenOpts, resourceRight } from "./commons.js";

/**
 * The resource the requested system user is asked for.
 *
 * Published and delegable in every environment this test runs in. The resource it
 * used to name, ttd-dialogporten-performance-test-01, is not published in at23 and
 * not delegable in yt01, so the test could only ever run in at22.
 */
const RESOURCE = "k6-instancedelegation-test";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

export { setup } from "./commons.js";

export default function (data) {
    const [clients, approverTokenGenerator, vendorTokenGenerator] = getClients();
    const customer = getItemFromList(data, randomize);

    const rights = [resourceRight(RESOURCE)];

    const registration = createSystemRegistration({
        systemNamePrefix: "perftest",
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

        let requestId;

        group("Create the system user request", function () {
            const createRequest = new CreateRequestSystemUserBuilder()
                .withExternalRef(registration.externalRef)
                .withSystemId(registration.systemId)
                .withPartyOrgNo(customer.orgNo)
                .withRights(rights)
                .withRedirectUrl(registration.redirectUrl)
                .build();

            const request = new CreateRequestSystemUserBuilder().withAccessPackages().build();

            const createdRequest = RequestSystemUserBuildingBlocks.VendorCreate(clients.vendor.requestSystemUserClient, createRequest);

            SystemUserRequestDomainChecks.CheckRequestCreated(createdRequest, {
                systemId: registration.systemId,
                partyOrgNo: customer.orgNo,
                externalRef: registration.externalRef,
            });

            requestId = createdRequest?.id;
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

            if (systemUser?.id !== undefined) {
                DeleteSystemUser(clients.approver.bffSystemUserClient, customer.partyId, systemUser.id);
            }

            SystemRegisterBuildingBlocks.VendorDelete(clients.vendor.systemRegisterClient, registration.systemId);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
