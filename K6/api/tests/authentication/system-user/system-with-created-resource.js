import { fail, group } from "k6";

import { XacmlPolicyBuilder } from "../../../../clients/resource-registry/index.js";
import { uuidv4 } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { RegisterSystemRequestBuilder, SystemRegisterBuildingBlocks, SystemRegisterDomainChecks } from "../../../authentication-imports.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
    ResourceDeleteResource,
} from "../../../building-blocks/resource-registry/resource/index.js";
import { resource as resourceRight } from "../change-request-system-user/commons.js";
import { createResourcePayload, getResourceFlowClients, RESOURCE_FLOW_VENDOR_ORG_NO } from "../commons.js";

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

const SYSTEM_NAME_PREFIX = "K6-systemuser-resource-";

/**
 * What the setup arranges, and what the test and the teardown work on.
 *
 * @typedef {object} ArrangedResourceSystem
 * @property {string} resourceIdentifier Identifier of the resource that was created.
 * @property {string} systemId Identifier of the system that was registered.
 * @property {import("../../../../clients/authentication/types.js").Right[]} rights The rights the system was registered with.
 */

/**
 * Arranges what the test reads: a resource created on the fly, a policy on it,
 * and a system registered with a right on that resource.
 *
 * The arrange sits in setup rather than in the test body so the teardown can
 * remove it. A failure in the body aborts the iteration, and inline cleanup would
 * not run; teardown does. When the arrange itself gives up, k6 skips the teardown,
 * so each step here removes what the previous ones made before failing.
 *
 * @returns {ArrangedResourceSystem} The identifiers the test and the teardown work on.
 */
export function setup() {
    requireEnv([
        "BASE_URL",
        "ENVIRONMENT",
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
    ]);

    const clients = getResourceFlowClients();
    const resource = createResourcePayload("k6-systemuser-resource-");

    const rights = [
        {
            ...resourceRight(resource.identifier),
            action: ACTION,
        },
    ];

    const systemName = `${SYSTEM_NAME_PREFIX}${uuidv4()}`;
    const systemId = `${RESOURCE_FLOW_VENDOR_ORG_NO}_${systemName}`;

    group("Arrange - create the resource and register a system with a right on it", function () {
        if (!ResourceCreateResource(
            clients.resourceOwner.resourceClient,
            resource,
            { step: "1. Create the resource" },
        )) {
            fail("cannot continue: the resource was not created");
        }

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
            { step: "2. Publish the policy" },
        )) {
            ResourceDeleteResource(
                clients.resourceOwner.resourceClient,
                resource.identifier,
                { step: "Cleanup - delete the resource" },
            );

            fail("cannot continue: the policy was not published, so the resource has no rights to ask for");
        }

        const registerSystemRequest = new RegisterSystemRequestBuilder()
            .withId(systemId)
            .withVendor(`0192:${RESOURCE_FLOW_VENDOR_ORG_NO}`)
            .withName({
                en: systemName,
                nb: systemName,
                nn: systemName,
            })
            .withDescription({
                en: "Created by a K6 test to check that a resource created on the fly can be used as a right on a system.",
                nb: "Opprettet av en K6-test for å sjekke at en ressurs opprettet underveis kan brukes som rettighet på et system.",
                nn: "Oppretta av ein K6-test for å sjekke at ein ressurs oppretta undervegs kan brukast som rett på eit system.",
            })
            .withRights(rights)
            .withClientId([uuidv4()])
            .withVisibility(false)
            .withAllowedRedirectUrls(["https://altinn.no"])
            .build();

        const createdSystemId = SystemRegisterBuildingBlocks.VendorCreate(
            clients.vendor.systemRegisterClient,
            registerSystemRequest,
        );

        if (createdSystemId === null) {
            ResourceDeleteResource(
                clients.resourceOwner.resourceClient,
                resource.identifier,
                { step: "Cleanup - delete the resource" },
            );

            fail("cannot continue: registering the system did not return a system id");
        }
    });

    return {
        resourceIdentifier: resource.identifier,
        systemId,
        rights,
    };
}

/**
 * Test: a resource created on the fly is usable as a right on a system.
 *
 * Nothing here leans on a resource somebody provisioned by hand. The setup
 * creates a delegable generic resource, gives it a policy and registers a system
 * that asks for a right on it, and this reads the right back the way a consumer
 * sees it.
 *
 * The system register rejects a right on a resource that does not exist, so the
 * arrange getting this far already says the resource was accepted rather than
 * merely ignored.
 *
 * @param {ReturnType<typeof setup>} data What the setup arranged.
 */
export default function (data) {
    const clients = getResourceFlowClients();

    group("The right on the system points at the resource created on the fly", function () {
        const registeredRights = SystemRegisterBuildingBlocks.GetRightsFrontend(
            clients.enduser.systemRegisterClient,
            data.systemId,
        );

        SystemRegisterDomainChecks.CheckRights(registeredRights, data.rights);
    });
}

/**
 * k6 teardown stage. Removes the system and the resource the setup arranged.
 *
 * The system goes first, since it is the one holding the right on the resource.
 *
 * @param {ReturnType<typeof setup>} data What the setup arranged.
 */
export function teardown(data) {
    const clients = getResourceFlowClients();

    group("Cleanup - delete the system and the resource", function () {
        const deleteResult = SystemRegisterBuildingBlocks.VendorDelete(
            clients.vendor.systemRegisterClient,
            data.systemId,
        );

        SystemRegisterDomainChecks.CheckUpdateSucceeded(deleteResult, "SystemRegisterVendorDelete");

        ResourceDeleteResource(
            clients.resourceOwner.resourceClient,
            data.resourceIdentifier,
            { step: "Delete the resource" },
        );
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
