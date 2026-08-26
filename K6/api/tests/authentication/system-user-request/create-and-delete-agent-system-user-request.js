import { fail, group } from "k6";

import { getItemFromList } from "../../../../helpers.js";
import { CreateAgentRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-imports.js";
import { createSystemRegistration, getClients, getVendorTokenOpts, sweepSystems } from "./commons.js";

/**
 * The access package the agent system user is asked for.
 *
 * An agent system user is asked for access packages rather than rights, since it
 * acts on behalf of the facilitator's clients. This one belongs to the property
 * manager role and exists in every environment.
 */
const ACCESS_PACKAGE = "urn:altinn:accesspackage:forretningsforer-eiendom";

/**
 * What this test names its systems, which is also what its teardown sweeps up.
 * Unique per test, or two tests running at once would delete each other's systems.
 */
const SYSTEM_NAME_PREFIX = "agentrequestdelete";

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
 * @param {ReturnType<typeof import("./commons.js").setup>} data The customers and the vendor from setup.
 */
export default function (data) {
    const [clients, , vendorTokenGenerator] = getClients();
    const customer = getItemFromList(data.customers, randomize);

    const registration = createSystemRegistration({
        systemNamePrefix: SYSTEM_NAME_PREFIX,
        vendorOrgNo: data.vendorOrgNo,
        registeredRights: [],
        registeredAccessPackages: [ACCESS_PACKAGE],
    });

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(registration.systemOwner));

    group("As a vendor, I can request an agent system user, find it by external ref and withdraw it", function () {
        group("Register the system the request is made for", function () {
            const createdSystemId = SystemRegisterBuildingBlocks.VendorCreate(clients.vendor.systemRegisterClient, registration.registerSystemRequest);

            if (createdSystemId === null) {
                fail("cannot request an agent system user: registering the system did not return a system id");
            }
        });

        let requestId;

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
