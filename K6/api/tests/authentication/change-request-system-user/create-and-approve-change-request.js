import { fail, group } from "k6";
import { vu } from "k6/execution";

import { uuidv4 } from "../../../../common-imports.js";
import { AltinnScopes } from "../../../../scopes.js";
import { ChangeRequestSystemUserBuilder, ChangeRequestSystemUserBuildingBlocks, ChangeRequestSystemUserDomainChecks, CreateRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-v2-imports.js";
import { PrerequisiteDomainChecks } from "../../../domain-checks/common/prerequisite.js";
import { createSystemUserTestContext, fetchCustomers, resourceRight } from "../../../fixtures/authentication/system-user.js";

const GRANTED_RESOURCE = "ttd-dialogporten-performance-test-01";
const REQUESTED_RESOURCE = "authentication-e2e-test";

export function setup() {
    return fetchCustomers();
}

export default function (data) {
    const customer = data[vu.idInTest - 1];

    const grantedRights = [resourceRight(GRANTED_RESOURCE)];
    const requestedRights = [resourceRight(REQUESTED_RESOURCE)];

    // Registered with both, so the change request can ask for a right the system
    // user was not granted at the outset.
    const test = createSystemUserTestContext(customer, {
        systemNamePrefix: "changerequest",
        registeredRights: [...grantedRights, ...requestedRights],
        // Looking the system user up by external id is behind its own scope.
        additionalVendorScopes: [AltinnScopes.MASKINPORTEN.SYSTEMUSER.READ],
    });

    group("As a vendor, I can ask an existing system user for more rights", function () {
        let systemUserId;

        group("Give the customer a system user to change", function () {
            SystemRegisterBuildingBlocks.CreateRegisteredSystem(test.vendor.systemRegisterClient, test.registerSystemRequest);

            const createRequest = new CreateRequestSystemUserBuilder()
                .withExternalRef(test.externalRef)
                .withSystemId(test.systemId)
                .withPartyOrgNo(customer.orgNo)
                .withRights(grantedRights)
                .withRedirectUrl(test.redirectUrl)
                .build();

            const createdRequest = RequestSystemUserBuildingBlocks.CreateRequest(test.vendor.requestSystemUserClient, createRequest);

            SystemUserRequestDomainChecks.CheckRequestCreated(createdRequest, {
                systemId: test.systemId,
                partyOrgNo: customer.orgNo,
                externalRef: test.externalRef,
            });

            if (!PrerequisiteDomainChecks.CheckPrerequisite(createdRequest, "the system user request was created")) {
                fail("missing prerequisite: the system user request was created");
            }

            const approved = RequestSystemUserBuildingBlocks.ApproveSystemUserRequest(
                test.approver.requestSystemUserClient,
                customer.partyId,
                createdRequest?.id,
            );

            SystemUserRequestDomainChecks.CheckRequestApproved(approved);

            const systemUser = SystemUserBuildingBlocks.GetByExternalId(test.vendor.systemUserClient, {
                clientId: test.clientId,
                systemProviderOrgNo: test.systemOwner,
                systemUserOwnerOrgNo: customer.orgNo,
                externalRef: test.externalRef,
            });

            systemUserId = systemUser?.id;
        });

        group("Asking for nothing needs no change", function () {
            if (!PrerequisiteDomainChecks.CheckPrerequisite(systemUserId, "the customer has a system user to change")) {
                fail("missing prerequisite: the customer has a system user to change");
            }

            const emptyChangeRequest = new ChangeRequestSystemUserBuilder()
                .withRedirectUrl(test.redirectUrl)
                .build();

            const changeRequest = ChangeRequestSystemUserBuildingBlocks.CreateChangeRequest(
                test.vendor.changeRequestClient,
                emptyChangeRequest,
                uuidv4(),
                systemUserId,
            );

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestStatus(changeRequest, "NoChangeNeeded");
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestIsEmpty(changeRequest);
        });

        let changeRequestId;

        group("Ask for a right the system user does not have", function () {
            if (!PrerequisiteDomainChecks.CheckPrerequisite(systemUserId, "the customer has a system user to change")) {
                fail("missing prerequisite: the customer has a system user to change");
            }

            const request = new ChangeRequestSystemUserBuilder()
                .withRequiredRights(requestedRights)
                .withRedirectUrl(test.redirectUrl)
                .build();

            const changeRequest = ChangeRequestSystemUserBuildingBlocks.CreateChangeRequest(
                test.vendor.changeRequestClient,
                request,
                uuidv4(),
                systemUserId,
            );

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestCreated(changeRequest, {
                systemId: test.systemId,
                partyOrgNo: customer.orgNo,
                systemUserId,
            });

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestRequiredRights(changeRequest, requestedRights);

            changeRequestId = changeRequest?.id;
        });

        group("The customer approves the change", function () {
            if (!PrerequisiteDomainChecks.CheckPrerequisite(changeRequestId, "a change request was created to approve")) {
                fail("missing prerequisite: a change request was created to approve");
            }

            const approved = ChangeRequestSystemUserBuildingBlocks.ApproveSystemUserChangeRequest(
                test.approver.changeRequestClient,
                customer.partyId,
                changeRequestId,
            );

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestApproved(approved);

            const changeRequest = ChangeRequestSystemUserBuildingBlocks.GetChangeRequestByGuid(test.vendor.changeRequestClient, changeRequestId);

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestStatus(changeRequest, "Accepted");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
