import { fail, group } from "k6";

import { getItemFromList } from "../../../../helpers.js";
import { CreateRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-imports.js";
import { ApproveSystemUserRequest } from "../../../building-blocks/access-management-bff/system-user-request/index.js";
import { createSystemRegistration, getApproverTokenOpts, getClients, resourceRight } from "./commons.js";

const RESOURCE = "ttd-dialogporten-performance-test-01";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

export { setup } from "./commons.js";

/**
 * @param {ReturnType<typeof import("./commons.js").setup>} data Test data from setup.
 */
export default function (data) {
    const [clients, approverTokenGenerator] = getClients();
    const customer = getItemFromList(data, randomize);

    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(customer));

    const rights = [resourceRight(RESOURCE)];

    const registration = createSystemRegistration({
        systemNamePrefix: "perftest",
        registeredRights: rights,
    });

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
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
