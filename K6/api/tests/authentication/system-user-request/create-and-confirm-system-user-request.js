import { fail, group } from "k6";

import { getItemFromList } from "../../../../helpers.js";
import { CreateRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-v2-imports.js";
import { PrerequisiteDomainChecks } from "../../../domain-checks/common/prerequisite.js";
import { createSystemRegistration, fetchCustomers, getApproverTokenOpts, getClients, resourceRight } from "../commons.js";

const RESOURCE = "ttd-dialogporten-performance-test-01";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * k6 setup stage. Runs once before the iterations.
 *
 * @returns {object[]} The customers this test acts on behalf of.
 */
export function setup() {
    return fetchCustomers();
}

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
            SystemRegisterBuildingBlocks.CreateRegisteredSystem(clients.vendor.systemRegisterClient, registration.registerSystemRequest);
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

            const createdRequest = RequestSystemUserBuildingBlocks.CreateRequest(clients.vendor.requestSystemUserClient, createRequest);

            SystemUserRequestDomainChecks.CheckRequestCreated(createdRequest, {
                systemId: registration.systemId,
                partyOrgNo: customer.orgNo,
                externalRef: registration.externalRef,
            });

            requestId = createdRequest?.id;
        });

        group("Approve the request as the customer", function () {
            if (!PrerequisiteDomainChecks.CheckPrerequisite(requestId, "the system user request was created")) {
                fail("missing prerequisite: the system user request was created");
            }

            const approved = RequestSystemUserBuildingBlocks.ApproveSystemUserRequest(
                clients.approver.requestSystemUserClient,
                customer.partyId,
                requestId,
            );

            SystemUserRequestDomainChecks.CheckRequestApproved(approved);
        });

        group("The approved request is accepted", function () {
            if (!PrerequisiteDomainChecks.CheckPrerequisite(requestId, "the system user request was created")) {
                fail("missing prerequisite: the system user request was created");
            }

            const request = RequestSystemUserBuildingBlocks.GetRequestByGuid(clients.vendor.requestSystemUserClient, requestId);

            SystemUserRequestDomainChecks.CheckRequestStatus(request, "Accepted");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
