import { fail, group } from "k6";

import { uuidv4 } from "../../../../common-imports.js";
import { getItemFromList } from "../../../../helpers.js";
import { ChangeRequestSystemUserBuilder, ChangeRequestSystemUserBuildingBlocks, ChangeRequestSystemUserDomainChecks } from "../../../authentication-v2-imports.js";
import { PrerequisiteDomainChecks } from "../../../domain-checks/common/prerequisite.js";
import { createApprovedSystemUser, createSystemRegistration, getApproverTokenOpts, getClients, resourceRight } from "../commons.js";

const GRANTED_RESOURCE = "ttd-dialogporten-performance-test-01";
const REQUESTED_RESOURCE = "authentication-e2e-test";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

export { setup } from "../commons.js";

export default function (data) {
    const [clients, approverTokenGenerator] = getClients();
    const customer = getItemFromList(data, randomize);

    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(customer));

    const grantedRights = [resourceRight(GRANTED_RESOURCE)];
    const requestedRights = [resourceRight(REQUESTED_RESOURCE)];

    // Registered with both, so the change request can ask for a right the system
    // user was not granted at the outset.
    const registration = createSystemRegistration({
        systemNamePrefix: "changerequest",
        registeredRights: [...grantedRights, ...requestedRights],
    });

    const systemUserId = createApprovedSystemUser(registration, customer, grantedRights);

    group("As a vendor, I can ask an existing system user for more rights", function () {
        group("Asking for nothing needs no change", function () {

            const emptyChangeRequest = new ChangeRequestSystemUserBuilder()
                .withRedirectUrl(registration.redirectUrl)
                .build();

            const changeRequest = ChangeRequestSystemUserBuildingBlocks.CreateChangeRequest(
                clients.vendor.changeRequestClient,
                emptyChangeRequest,
                uuidv4(),
                systemUserId,
            );

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestStatus(changeRequest, "NoChangeNeeded");
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestIsEmpty(changeRequest);
        });

        let changeRequestId;

        group("Ask for a right the system user does not have", function () {

            const request = new ChangeRequestSystemUserBuilder()
                .withRequiredRights(requestedRights)
                .withRedirectUrl(registration.redirectUrl)
                .build();

            const changeRequest = ChangeRequestSystemUserBuildingBlocks.CreateChangeRequest(
                clients.vendor.changeRequestClient,
                request,
                uuidv4(),
                systemUserId,
            );

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestCreated(changeRequest, {
                systemId: registration.systemId,
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
                clients.approver.changeRequestClient,
                customer.partyId,
                changeRequestId,
            );

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestApproved(approved);

            const changeRequest = ChangeRequestSystemUserBuildingBlocks.GetChangeRequestByGuid(clients.vendor.changeRequestClient, changeRequestId);

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestStatus(changeRequest, "Accepted");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
