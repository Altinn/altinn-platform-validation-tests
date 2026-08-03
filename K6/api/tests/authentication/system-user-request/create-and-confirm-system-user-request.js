import { fail, group } from "k6";
import { vu } from "k6/execution";

import { RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-v2-imports.js";
import { CreateRequestSystemUserBuilder } from "../../../authentication-v2-imports.js";
import { PrerequisiteDomainChecks } from "../../../domain-checks/common/prerequisite.js";
import { createSystemUserTestContext, fetchCustomers, resourceRight } from "../../../fixtures/authentication/system-user.js";

const RESOURCE = "ttd-dialogporten-performance-test-01";

export function setup() {
    return fetchCustomers();
}

export default function (data) {
    const customer = data[vu.idInTest - 1];

    const rights = [resourceRight(RESOURCE)];

    const test = createSystemUserTestContext(customer, {
        systemNamePrefix: "perftest",
        registeredRights: rights,
    });

    group("As a vendor, I can request a system user and have the customer approve it", function () {
        group("Register the system the request is made for", function () {
            SystemRegisterBuildingBlocks.CreateRegisteredSystem(test.vendor.systemRegisterClient, test.registerSystemRequest);
        });

        let requestId;

        group("Create the system user request", function () {
            const createRequest = new CreateRequestSystemUserBuilder()
                .withExternalRef(test.externalRef)
                .withSystemId(test.systemId)
                .withPartyOrgNo(customer.orgNo)
                .withRights(rights)
                .withRedirectUrl(test.redirectUrl)
                .build();

            const createdRequest = RequestSystemUserBuildingBlocks.CreateRequest(test.vendor.requestSystemUserClient, createRequest);

            SystemUserRequestDomainChecks.CheckRequestCreated(createdRequest, {
                systemId: test.systemId,
                partyOrgNo: customer.orgNo,
                externalRef: test.externalRef,
            });

            requestId = createdRequest?.id;
        });

        group("Approve the request as the customer", function () {
            if (!PrerequisiteDomainChecks.CheckPrerequisite(requestId, "the system user request was created")) {
                fail("missing prerequisite: the system user request was created");
            }

            const approved = RequestSystemUserBuildingBlocks.ApproveSystemUserRequest(
                test.approver.requestSystemUserClient,
                customer.partyId,
                requestId,
            );

            SystemUserRequestDomainChecks.CheckRequestApproved(approved);
        });

        group("The approved request is accepted", function () {
            if (!PrerequisiteDomainChecks.CheckPrerequisite(requestId, "the system user request was created")) {
                fail("missing prerequisite: the system user request was created");
            }

            const request = RequestSystemUserBuildingBlocks.GetRequestByGuid(test.vendor.requestSystemUserClient, requestId);

            SystemUserRequestDomainChecks.CheckRequestStatus(request, "Accepted");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
