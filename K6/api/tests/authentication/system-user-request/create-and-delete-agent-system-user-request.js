import { fail, group } from "k6";

import { getItemFromList } from "../../../../helpers.js";
import { CreateAgentRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-imports.js";
import { createSystemRegistration, getClients, getVendorTokenOpts } from "./commons.js";

/**
 * The access package the agent system user is asked for.
 *
 * An agent system user is asked for access packages rather than rights, since it
 * acts on behalf of the facilitator's clients. This one belongs to the property
 * manager role and exists in every environment.
 */
const ACCESS_PACKAGE = "urn:altinn:accesspackage:forretningsforer-eiendom";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

export { setup } from "./commons.js";

/**
 * Test: a vendor can ask for an agent system user, find it again and withdraw it.
 *
 * get-agent-system-user-requests-by-system-id.js only lists the requests an
 * existing system already has. Creating one, looking it up by its external ref and
 * withdrawing it were all untested, which is what issue #432 pointed out.
 *
 * The request is left unapproved on purpose: approving it is the facilitator's
 * action in the portal, and the client delegation test covers that flow.
 *
 * @param {object[]} data The customers from setup.
 */
export default function (data) {
    const [clients, , vendorTokenGenerator] = getClients();
    const customer = getItemFromList(data, randomize);

    const registration = createSystemRegistration({
        systemNamePrefix: "agentrequestdelete",
        registeredRights: [],
        registeredAccessPackages: [ACCESS_PACKAGE],
    });

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(registration.systemOwner));

    group("As a vendor, I can request an agent system user, find it by external ref and withdraw it", function () {
        // What the cleanup below has to take back out. Tracked rather than assumed,
        // since a step that fails calls fail(), and deleting a system that was never
        // registered only turns one failure into two.
        let systemRegistered = false;
        let requestId;

        try {
            group("Register the system the request is made for", function () {
                const createdSystemId = SystemRegisterBuildingBlocks.VendorCreate(clients.vendor.systemRegisterClient, registration.registerSystemRequest);

                if (createdSystemId === null) {
                    fail("cannot request an agent system user: registering the system did not return a system id");
                }

                systemRegistered = true;
            });

            group("Create the agent system user request", function () {
                const createRequest = new CreateAgentRequestSystemUserBuilder()
                    .withExternalRef(registration.externalRef)
                    .withSystemId(registration.systemId)
                    .withPartyOrgNo(customer.orgNo)
                    .withAccessPackages([{ urn: ACCESS_PACKAGE }])
                    .withRedirectUrl(registration.redirectUrl)
                    .build();

                const createdRequest = RequestSystemUserBuildingBlocks.VendorAgentCreate(clients.vendor.requestSystemUserClient, createRequest);

                SystemUserRequestDomainChecks.CheckRequestCreated(createdRequest, {
                    systemId: registration.systemId,
                    partyOrgNo: customer.orgNo,
                    externalRef: registration.externalRef,
                });

                requestId = createdRequest?.id;
            });

            group("Find the agent request by its external ref", function () {
                const request = RequestSystemUserBuildingBlocks.VendorAgentGetByExternalRef(
                    clients.vendor.requestSystemUserClient,
                    registration.systemId,
                    customer.orgNo,
                    registration.externalRef,
                );

                SystemUserRequestDomainChecks.CheckSameRequest(request, requestId);
            });

            group("Read the agent request back by id", function () {
                if (!SystemUserRequestDomainChecks.CheckRequestId(requestId)) {
                    fail("cannot read the request back: creating the agent system user request returned no id");
                }

                const request = RequestSystemUserBuildingBlocks.VendorAgentGet(clients.vendor.requestSystemUserClient, requestId);

                SystemUserRequestDomainChecks.CheckRequestStatus(request, "New");
            });

            group("Withdraw the agent request", function () {
                const deleted = RequestSystemUserBuildingBlocks.VendorDelete(clients.vendor.requestSystemUserClient, requestId);

                SystemUserRequestDomainChecks.CheckRequestDeleted(deleted);
            });
        } finally {
            // Every iteration registers a system of its own, so the cleanup belongs
            // here rather than in a teardown, and in a finally so that a failed step
            // still takes back what it managed to create.
            group("Cleanup - remove the system from the register", function () {
                if (systemRegistered) {
                    SystemRegisterBuildingBlocks.VendorDelete(clients.vendor.systemRegisterClient, registration.systemId);
                }
            });
        }
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
