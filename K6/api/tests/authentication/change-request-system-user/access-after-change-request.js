import { fail, group } from "k6";

import {
    buildXacmlJsonAttributeExternal,
    buildXacmlJsonCategoryExternal,
    buildXacmlJsonRequestExternal,
    buildXacmlJsonRequestRootExternal,
} from "../../../../clients/authorization/builders.js";
import { AuthorizeClient } from "../../../../clients/authorization/index.js";
import { XacmlJsonRequestRootExternal } from "../../../../clients/authorization/types.js";
import { XacmlPolicyBuilder } from "../../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { ChangeRequestSystemUserBuilder, ChangeRequestSystemUserBuildingBlocks, ChangeRequestSystemUserDomainChecks } from "../../../authentication-imports.js";
import { ApproveChangeRequest } from "../../../building-blocks/access-management-bff/system-user-change-request/index.js";
import { AuthorizePost } from "../../../building-blocks/authorization/authorize/post.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
    ResourceDeleteResource,
} from "../../../building-blocks/resource-registry/resource/index.js";
import { createResourcePayload, getResourceFlowClients } from "../system-user/commons.js";
import { accessPackage, arrangeApprovedSystemUser, cleanupArranged, getApproverTokenOpts, getClients, getVendorTokenOpts, pickVendor, REDIRECT_URL } from "./commons.js";

/**
 * The access package the resource requires, and the one the system user is
 * granted up front. Named in the bug report this test comes from, rather than
 * searched for, since the report is about these two packages sitting in the same
 * area of the catalogue.
 *
 * @see https://github.com/Altinn/altinn-authorization-tmp/issues/3933
 */
const REQUIRED_PACKAGE = "urn:altinn:accesspackage:lonn";

/**
 * The access package the change request adds on top. It gives no access to the
 * resource, so nothing about the decision should change when it is added.
 */
const ADDED_PACKAGE = "urn:altinn:accesspackage:a-ordning";

/**
 * The action the policy grants and the decision requests ask for.
 */
const ACTION = "read";

const MINIMUM_AUTHENTICATION_LEVEL = 3;

const SYSTEM_NAME_PREFIX = "changerequestaccess";

/**
 * @type {AuthorizeClient | undefined}
 */
let authorizeClient = undefined;

/**
 * Creates and caches the client the decision requests go through.
 *
 * The admin scope lets one token ask on behalf of every subject, so the client is
 * built once per VU rather than per system user.
 *
 * @returns {AuthorizeClient} Client for the PDP.
 */
function getAuthorizeClient() {
    if (authorizeClient === undefined) {
        authorizeClient = new AuthorizeClient(
            __ENV.BASE_URL,
            new EnterpriseTokenGenerator(
                new EnterpriseTokenBuilder()
                    .withEnvironment(__ENV.ENVIRONMENT)
                    .withTtl(3600)
                    .withScopes(CreateScopeString([AltinnScopes.AUTHORIZATION.AUTHORIZE.ADMIN]))
                    .build(),
            ),
            __ENV.AUTHORIZATION_SUBSCRIPTION_KEY,
        );
    }

    return authorizeClient;
}

/**
 * Builds the decision request a service makes when a system user calls it: may
 * this system user perform the action on this resource for this organization.
 *
 * @param {string} systemUserId Identifier of the system user asking.
 * @param {string} orgNo Organization number of the party the resource is looked up for.
 * @param {string} resourceIdentifier Resource the system user is asking for.
 * @returns {XacmlJsonRequestRootExternal} Decision request.
 */
function buildSystemUserRequest(systemUserId, orgNo, resourceIdentifier) {
    return buildXacmlJsonRequestRootExternal({
        request: buildXacmlJsonRequestExternal({
            accessSubject: [
                buildXacmlJsonCategoryExternal({
                    attribute: [
                        buildXacmlJsonAttributeExternal({
                            attributeId: "urn:altinn:systemuser:uuid",
                            value: systemUserId,
                        }),
                    ],
                }),
            ],
            action: [
                buildXacmlJsonCategoryExternal({
                    attribute: [
                        buildXacmlJsonAttributeExternal({
                            attributeId: "urn:oasis:names:tc:xacml:1.0:action:action-id",
                            value: ACTION,
                        }),
                    ],
                }),
            ],
            resource: [
                buildXacmlJsonCategoryExternal({
                    attribute: [
                        buildXacmlJsonAttributeExternal({
                            attributeId: "urn:altinn:resource",
                            value: resourceIdentifier,
                        }),
                        buildXacmlJsonAttributeExternal({
                            attributeId: "urn:altinn:organization:identifier-no",
                            value: orgNo,
                        }),
                    ],
                }),
            ],
        }),
    });
}

/**
 * k6 setup stage. Arranges a resource only one access package opens, and a system
 * user granted that package.
 *
 * The resource is created here rather than named, so the policy grants the one
 * package and nothing else, and the system user is granted no rights at all. That
 * leaves the access package as the only way a decision can come back Permit.
 *
 * @returns The system user to change, as a single item list, carrying the resource it has access to.
 */
export function setup() {
    requireEnv([
        "ENVIRONMENT",
        "BASE_URL",
        "AM_UI_BASE_URL",
        "AUTHORIZATION_SUBSCRIPTION_KEY",
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
    ]);

    const resourceClients = getResourceFlowClients();
    const resource = createResourcePayload("k6-changerequest-access-");

    group("Arrange - a resource the access package opens", function () {
        if (!ResourceCreateResource(
            resourceClients.resourceOwner.resourceClient,
            resource,
            { step: "1. Create the resource" },
        )) {
            fail("cannot continue: the resource was not created");
        }

        const policyFile = new XacmlPolicyBuilder(resource.identifier)
            .withRule({
                accessPackages: [REQUIRED_PACKAGE.split(":").pop()],
                actions: [ACTION],
                description: `Access package that gets access to the K6 change request resource: ${REQUIRED_PACKAGE}`,
            })
            .withMinimumAuthenticationLevel(MINIMUM_AUTHENTICATION_LEVEL)
            .buildFile();

        if (!ResourceCreatePolicy(
            resourceClients.resourceOwner.resourceClient,
            resource.identifier,
            policyFile,
            { step: "2. Publish the policy" },
        )) {
            ResourceDeleteResource(
                resourceClients.resourceOwner.resourceClient,
                resource.identifier,
                { step: "Cleanup - delete the resource" },
            );

            fail("cannot continue: the policy was not published, so the access package opens nothing");
        }
    });

    // Drawn once here rather than per iteration, since the system belongs to the
    // vendor that registered it and every iteration acts on that same system.
    const vendorOrgNo = pickVendor();

    const arranged = arrangeApprovedSystemUser({
        systemNamePrefix: SYSTEM_NAME_PREFIX,
        vendorOrgNo,
        grantedRights: [],
        grantedAccessPackages: [REQUIRED_PACKAGE],
        registeredAccessPackages: [REQUIRED_PACKAGE, ADDED_PACKAGE],
    });

    return arranged.map((systemUser) => ({
        ...systemUser,
        resourceIdentifier: resource.identifier,
    }));
}

/**
 * Test: adding an access package to a system user does not take away the access
 * it already had.
 *
 * This is the flow from the bug report, where a system user that had been granted
 * lonn was denied a resource that lonn opens, right after a change request added
 * a-ordning on top. The decision is asked for before the change as well, so a run
 * that fails says whether the access was ever there.
 *
 * @param {any[]} data The arranged system users from setup.
 */
export default function (data) {
    const systemUser = data[0];
    const [clients, approverTokenGenerator, vendorTokenGenerator] = getClients();

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(systemUser.vendorOrgNo));
    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(systemUser.customer));

    // The arrange hands back a system user id only when every step of it worked,
    // rather than failing the run, so that its teardown gets to remove what it did
    // create. Nothing below says anything without one.
    if (!ChangeRequestSystemUserDomainChecks.CheckSystemUserToChange(systemUser.systemUserId)) {
        fail("cannot ask for a decision: the setup produced no system user");
    }

    const request = buildSystemUserRequest(
        systemUser.systemUserId,
        systemUser.customer.orgNo,
        systemUser.resourceIdentifier,
    );

    group("The access package the system user was granted opens the resource", function () {
        AuthorizePost(getAuthorizeClient(), request, "Permit", { step: "Decision before the change" });
    });

    group("The vendor adds another access package the system user does not have", function () {
        const changeRequest = ChangeRequestSystemUserBuildingBlocks.VendorCreate(
            clients.vendor.changeRequestClient,
            new ChangeRequestSystemUserBuilder()
                .withRequiredAccessPackages([accessPackage(ADDED_PACKAGE)])
                .withRedirectUrl(REDIRECT_URL)
                .build(),
            uuidv4(),
            systemUser.systemUserId,
            201,
        );

        if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestId(changeRequest?.id)) {
            fail("cannot approve: no change request was created to approve");
        }

        const approved = ApproveChangeRequest(
            clients.approver.bffChangeRequestClient,
            systemUser.customer.orgPartyId,
            changeRequest.id,
        );

        if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestApproved(approved)) {
            fail("cannot ask for a decision after the change: approving the change request failed");
        }
    });

    group("The system user still has the access it had before the change", function () {
        AuthorizePost(getAuthorizeClient(), request, "Permit", { step: "Decision after the change" });
    });
}

/**
 * k6 teardown stage. Removes the system user, the system it belongs to and the
 * resource the setup created.
 *
 * @param {any[]} data The arranged system users from setup.
 */
export function teardown(data) {
    cleanupArranged(data);

    const resourceClients = getResourceFlowClients();

    group("Cleanup - delete the resource", function () {
        for (const systemUser of data ?? []) {
            ResourceDeleteResource(
                resourceClients.resourceOwner.resourceClient,
                systemUser.resourceIdentifier,
                { step: "Delete the resource" },
            );
        }
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
