import { group } from "k6";

import {
    ResourceClient,
    ResourceType,
    ServiceResourceBuilder,
    XacmlPolicyBuilder,
} from "../../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
    ResourceDeleteResource,
    ResourceGetPolicyRights,
    ResourceGetResource,
} from "../../../building-blocks/resource-registry/resource/index.js";

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

const ROLES = ["DAGL", "REGNA"];
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
 * Writing to the registry needs an enterprise token with the resource.write
 * scope. ttd owns the resource, since it is the one service owner the registry
 * lets create resources without an organization number.
 */
export default function () {
    const tokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withOrganization("ttd")
            .withScopes(CreateScopeString([
                AltinnScopes.RESOURCEREGISTRY.RESOURCE.WRITE,
            ]))
            .build(),
    );

    const resourceClient = new ResourceClient(__ENV.BASE_URL, tokenGenerator);

    // Every field the registry validates is spelled out here rather than coming
    // from the builder, so the payload under test is visible in the test.
    const resource = new ServiceResourceBuilder(`k6-test-resource-${uuidv4()}`)
        .withTitle(RESOURCE_TEXTS)
        .withDescription(RESOURCE_TEXTS)
        .withRightDescription(RIGHT_DESCRIPTION_TEXTS)
        .withResourceType(ResourceType.GenericAccessResource)
        .withCompetentAuthority("ttd", null, "Testdepartementet")
        .withContactPoint(CONTACT_POINT)
        .withStatus("Completed")
        .withDelegable(false)
        .withVisible(false)
        .withKeyword("k6")
        .build();

    group("1. Create the resource", () => {
        ResourceCreateResource(resourceClient, resource, createResourceLabel);
    });

    group("2. Read the resource back", () => {
        ResourceGetResource(resourceClient, resource.identifier, null, getResourceLabel);
    });

    group("3. Publish the policy", () => {
        const policyFile = new XacmlPolicyBuilder(resource.identifier)
            .withRule({
                roles: ROLES,
                actions: ACTIONS,
                description: "Roles that get access to the K6 test resource",
            })
            .withMinimumAuthenticationLevel(MINIMUM_AUTHENTICATION_LEVEL)
            .buildFile();

        ResourceCreatePolicy(
            resourceClient,
            resource.identifier,
            policyFile,
            createPolicyLabel,
        );
    });

    group("4. Read the rights the policy granted", () => {
        ResourceGetPolicyRights(resourceClient, resource.identifier, getPolicyRightsLabel);
    });

    group("5. Delete the resource", () => {
        ResourceDeleteResource(resourceClient, resource.identifier, deleteResourceLabel);
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
