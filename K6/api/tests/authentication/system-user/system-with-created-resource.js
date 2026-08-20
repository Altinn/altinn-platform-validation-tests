import { fail, group } from "k6";

import { XacmlPolicyBuilder } from "../../../../clients/resource-registry/index.js";
import { SystemRegisterBuildingBlocks, SystemRegisterDomainChecks } from "../../../authentication-imports.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
    ResourceDeleteResource,
} from "../../../building-blocks/resource-registry/resource/index.js";
import { createResourcePayload, createSystemRegistration, getClients, resourceRight } from "./commons.js";

/**
 * The action the system asks for on the resource. It has to be one the resource
 * policy grants, since a right on a system is a resource and action pair.
 */
const ACTION = "read";

/**
 * The role the policy grants the action to.
 */
const ROLES = ["DAGL"];

const MINIMUM_AUTHENTICATION_LEVEL = 3;

const createResourceLabel = { step: "1. Create the resource" };
const createPolicyLabel = { step: "2. Publish the policy" };
const deleteResourceLabel = { step: "6. Delete the resource" };

export { setup } from "./commons.js";

/**
 * Test: a resource created on the fly is usable as a right on a system.
 *
 * Nothing here leans on a resource somebody provisioned by hand. The test
 * creates a delegable generic resource, gives it a policy, registers a system
 * that asks for a right on it, and reads the right back the way a consumer sees
 * it. Both the system and the resource are removed again, so a passing run
 * leaves nothing behind.
 *
 * The system register rejects a right on a resource that does not exist, so a
 * green run says the resource was accepted rather than merely ignored.
 */
export default function () {
    const clients = getClients();

    const resource = createResourcePayload("k6-systemuser-resource-");

    const rights = [
        resourceRight(resource.identifier, ACTION),
    ];

    const { systemId, registerSystemRequest } = createSystemRegistration({
        systemNamePrefix: "K6-systemuser-resource-",
        registeredRights: rights,
    });

    group("A system can be registered with a right on a resource created on the fly", function () {
        group("1. Create the resource", function () {
            if (!ResourceCreateResource(
                clients.resourceOwner.resourceClient,
                resource,
                createResourceLabel,
            )) {
                fail("cannot continue: the resource was not created");
            }
        });

        group("2. Publish the policy for the resource", function () {
            const policyFile = new XacmlPolicyBuilder(resource.identifier)
                .withRule({
                    roles: ROLES,
                    actions: [ACTION],
                    description: "Roles that get access to the K6 system user resource",
                })
                .withMinimumAuthenticationLevel(MINIMUM_AUTHENTICATION_LEVEL)
                .buildFile();

            if (!ResourceCreatePolicy(
                clients.resourceOwner.resourceClient,
                resource.identifier,
                policyFile,
                createPolicyLabel,
            )) {
                fail("cannot continue: the policy was not published, so the resource has no rights to ask for");
            }
        });

        group("3. Register a system with a right on the resource", function () {
            const createdSystemId = SystemRegisterBuildingBlocks.VendorCreate(
                clients.vendor.systemRegisterClient,
                registerSystemRequest,
            );

            if (createdSystemId === null) {
                fail("cannot continue: registering the system did not return a system id");
            }
        });

        group("4. The right on the system points at the resource", function () {
            const registeredRights = SystemRegisterBuildingBlocks.GetRightsFrontend(
                clients.enduser.systemRegisterClient,
                systemId,
            );

            SystemRegisterDomainChecks.CheckRights(registeredRights, rights);
        });

        group("5. Delete the system", function () {
            const deleteResult = SystemRegisterBuildingBlocks.VendorDelete(
                clients.vendor.systemRegisterClient,
                systemId,
            );

            SystemRegisterDomainChecks.CheckUpdateSucceeded(deleteResult, "SystemRegisterVendorDelete");
        });

        group("6. Delete the resource", function () {
            ResourceDeleteResource(
                clients.resourceOwner.resourceClient,
                resource.identifier,
                deleteResourceLabel,
            );
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
