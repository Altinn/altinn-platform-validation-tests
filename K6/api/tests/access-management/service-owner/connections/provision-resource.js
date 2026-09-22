import { check, fail } from "k6";

import {
    ResourceClient,
    ResourcePartyType,
    ResourceType,
    ServiceResourceBuilder,
    XacmlPolicyBuilder,
} from "../../../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { getOptions, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
    ResourceGetPolicyRights,
    ResourceUpdateResource,
} from "../../../../building-blocks/resource-registry/resource/index.js";

export const RESOURCE_ID = "k6-serviceowner-resource-delegation";

const SERVICE_OWNER_ORG = "digdir";
const SERVICE_OWNER_ORG_NO = "991825827";
const ACTIONS = ["read", "write"];
const ACCESS_PACKAGES = ["jordbruk"];

const resourceLabel = { step: "1. Publish service owner test resource" };
const policyLabel = { step: "2. Publish service owner test policy" };
const verifyLabel = { step: "3. Verify service owner test rights" };

export const options = getOptions([
    resourceLabel,
    policyLabel,
    verifyLabel,
]);

export function setup() {
    requireEnv([
        "BASE_URL",
        "ENVIRONMENT",
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
    ]);
}

/**
 * Builds the stable resource metadata used by the functional test.
 *
 * @returns {import("../../../../../clients/resource-registry/types.js").ServiceResource}
 * Resource Registry payload.
 */
function buildResource() {
    return new ServiceResourceBuilder(RESOURCE_ID)
        .withText("K6 service owner resource delegation")
        .withResourceType(ResourceType.GenericAccessResource)
        .withCompetentAuthority(
            SERVICE_OWNER_ORG,
            SERVICE_OWNER_ORG_NO,
            "Digitaliseringsdirektoratet",
        )
        .withContactPoint({
            category: "Support",
            email: "noreply@digdir.no",
            telephone: "+4712345678",
            contactPage: "https://www.digdir.no",
        })
        .withStatus("Completed")
        .withAvailableForType([
            ResourcePartyType.LegalEntityEnterprise,
            ResourcePartyType.Company,
        ])
        .withDelegable(true)
        .withVisible(false)
        .withKeyword("k6")
        .build();
}

/**
 * Builds a policy that exposes stable right keys and links the resource to an
 * existing access package.
 *
 * @returns {*} XACML policy file.
 */
function buildPolicy() {
    return new XacmlPolicyBuilder(RESOURCE_ID)
        .withRule({
            accessPackages: ACCESS_PACKAGES,
            actions: ACTIONS,
            description: "Access package used by the service owner delegation test",
        })
        .withMinimumAuthenticationLevel(3)
        .buildFile();
}

export default function () {
    const tokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withOrganization(SERVICE_OWNER_ORG)
            .withOrganizationNumber(SERVICE_OWNER_ORG_NO)
            .withScopes(CreateScopeString([
                AltinnScopes.RESOURCEREGISTRY.RESOURCE.WRITE,
            ]))
            .build(),
    );
    const client = new ResourceClient(__ENV.BASE_URL, tokenGenerator);
    const resource = buildResource();
    const existingResource = client.ResourceGetResource(RESOURCE_ID);

    let resourcePublished = false;
    if (existingResource.status === 404) {
        resourcePublished = ResourceCreateResource(
            client,
            resource,
            resourceLabel,
        );
    } else if (existingResource.status === 200) {
        resourcePublished = ResourceUpdateResource(
            client,
            RESOURCE_ID,
            resource,
            resourceLabel,
        );
    } else {
        fail(
            `Unable to inspect ${RESOURCE_ID}: ` +
            `${existingResource.status} ${existingResource.body}`,
        );
    }

    if (!resourcePublished) {
        fail(`Unable to publish ${RESOURCE_ID}`);
    }

    const policyFile = buildPolicy();
    const policyPublished = ResourceCreatePolicy(
        client,
        RESOURCE_ID,
        policyFile,
        policyLabel,
    );

    if (!policyPublished) {
        fail(`Unable to publish policy for ${RESOURCE_ID}`);
    }

    const rights = ResourceGetPolicyRights(client, RESOURCE_ID, verifyLabel);

    check(rights, {
        "provisioned policy exposes every expected action": (items) =>
            ACTIONS.every((action) =>
                (items ?? []).some((right) => right.action?.value === action),
            ),
    });
}
