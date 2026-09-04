import { group } from "k6";

import {
    ResourceClient,
    ResourceType,
    ServiceResourceBuilder,
    SubjectAttribute,
    XacmlPolicyBuilder,
} from "../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, uuidv4 } from "../../../common-imports.js";
import { lazy, requireEnv } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
    ResourceDeleteResource,
    ResourceGetPolicyRights,
    ResourceGetResource,
} from "../../building-blocks/resource-registry/resource/index.js";
import { PolicyRightsDomainChecks } from "../../domain-checks/resource-registry/policy-rights.js";

const createResourceLabel = { step: "1. Create the resource" };
const getResourceLabel = { step: "2. Read the resource back" };
const createPolicyLabel = { step: "3. Publish the policy" };
const getPolicyRightsLabel = { step: "4. Read the rights the policy granted" };
const deleteResourceLabel = { step: "5. Delete the resource" };

// Dummy data. The identifier gets a uuid so reruns do not collide, and the
// registry only accepts a-z, 0-9, _ and - in it.
const RESOURCE_TEXTS = {
    nb: "K6 testressurs",
    nn: "K6 testressurs",
    en: "K6 test resource",
};

const RIGHT_DESCRIPTION_TEXTS = {
    nb: "Gir tilgang til K6-testressursen",
    nn: "Gir tilgang til K6-testressursen",
    en: "Grants access to the K6 test resource",
};

const CONTACT_POINT = {
    category: "Support",
    email: "noreply@digdir.no",
    telephone: "+4712345678",
    contactPage: "https://www.digdir.no",
};

// The registry checks the resource owner against the consumer claim in the
// token, so the organization number here and the one on the token have to be the
// same. yt01 runs on a different org than the rest.
const SERVICE_OWNER_ORG = "ttd";
const SERVICE_OWNER_ORG_NO = __ENV.ENVIRONMENT === "yt01" ? "713431400" : "991825827";

const ROLES = ["DAGL", "REGNA"];
const ACCESS_PACKAGES = ["jordbruk"];
const ACTIONS = ["read", "write"];
const MINIMUM_AUTHENTICATION_LEVEL = 3;

export function setup() {
    requireEnv([
        "BASE_URL",
        "ENVIRONMENT",
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
    ]);

    return;
}

/**
 * Test: a resource can be created and given a policy, and the registry reports
 * back the rights the policy granted.
 *
 * Not scheduled, and deliberately not wired into run-all.js either. Deleting a
 * resource leaves its rows in resourceregistry.resourcesubjects behind with
 * deleted set to false, and nothing cleans them up, reported as
 * Altinn/altinn-resource-registry#848 and concluded in #488. Every run leaks a
 * couple of rows, so run this one on purpose and not by habit until #848 is
 * fixed.
 *
 * Writing to the registry needs an enterprise token with the resource.write
 * scope, and the registry only lets the owner write: it compares the resource
 * owner organization number against the consumer claim in the token.
 */
/**
 * Creates and caches the client this test writes with.
 *
 * Cached at module scope, so a VU builds it once and keeps the token it fetched
 * rather than asking the token service again on every iteration.
 *
 * @returns {ResourceClient} The client.
 */
const getResourceClient = lazy(function () {
    const tokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withOrganization(SERVICE_OWNER_ORG)
            .withOrganizationNumber(SERVICE_OWNER_ORG_NO)
            .withScopes(CreateScopeString([
                AltinnScopes.RESOURCEREGISTRY.RESOURCE.WRITE,
            ]))
            .build(),
    );

    return new ResourceClient(__ENV.BASE_URL, tokenGenerator);
});

export default function () {
    const resourceClient = getResourceClient();

    // Every field the registry validates is spelled out here rather than coming
    // from the builder, so the payload under test is visible in the test.
    const resource = new ServiceResourceBuilder(`k6-test-resource-${uuidv4()}`)
        .withTitle(RESOURCE_TEXTS)
        .withDescription(RESOURCE_TEXTS)
        .withRightDescription(RIGHT_DESCRIPTION_TEXTS)
        .withResourceType(ResourceType.GenericAccessResource)
        .withCompetentAuthority(SERVICE_OWNER_ORG, SERVICE_OWNER_ORG_NO, "Testdepartementet")
        .withContactPoint(CONTACT_POINT)
        .withStatus("Completed")
        .withDelegable(false)
        .withVisible(false)
        .withKeyword("k6")
        .build();

    // Steps 2 to 4 all read or write this resource, so a failed create would turn
    // one root cause into a dozen failed checks. Skipping them beats fail(), which
    // would abort the iteration and leave the resource behind undeleted.
    let created = false;

    group("1. Create the resource", () => {
        created = ResourceCreateResource(resourceClient, resource, createResourceLabel);
    });

    if (created) {
        group("2. Read the resource back", () => {
            ResourceGetResource(resourceClient, resource.identifier, null, getResourceLabel);
        });

        let published = false;

        group("3. Publish the policy", () => {
            const policyFile = new XacmlPolicyBuilder(resource.identifier)
                .withRule({
                    roles: ROLES,
                    accessPackages: ACCESS_PACKAGES,
                    actions: ACTIONS,
                    description: "Roles and access packages that get access to the K6 test resource",
                })
                .withMinimumAuthenticationLevel(MINIMUM_AUTHENTICATION_LEVEL)
                .buildFile();

            published = ResourceCreatePolicy(
                resourceClient,
                resource.identifier,
                policyFile,
                createPolicyLabel,
            );
        });

        if (published) {
            group("4. Read the rights the policy granted", () => {
                const rights = ResourceGetPolicyRights(
                    resourceClient,
                    resource.identifier,
                    getPolicyRightsLabel,
                );

                PolicyRightsDomainChecks.CheckOneRightPerAction(
                    rights,
                    ACTIONS,
                    "ResourceGetPolicyRights",
                );
                PolicyRightsDomainChecks.CheckRightsForResource(
                    rights,
                    resource.identifier,
                    "ResourceGetPolicyRights",
                );
                PolicyRightsDomainChecks.CheckRightsCoverActions(
                    rights,
                    ACTIONS,
                    "ResourceGetPolicyRights",
                );
                PolicyRightsDomainChecks.CheckRightsGrantSubjects(
                    rights,
                    [...ROLES, ...ACCESS_PACKAGES],
                    "ResourceGetPolicyRights",
                );
                PolicyRightsDomainChecks.CheckRightsSubjectTypes(
                    rights,
                    [SubjectAttribute.RoleCode, SubjectAttribute.AccessPackage],
                    "ResourceGetPolicyRights",
                );
            });
        }
    }

    if (created) {
        group("5. Delete the resource", () => {
            ResourceDeleteResource(resourceClient, resource.identifier, deleteResourceLabel);
        });
    }
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
