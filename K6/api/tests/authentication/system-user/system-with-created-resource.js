import { fail, group } from "k6";

import {
    ResourceClient,
    ResourcePartyType,
    ResourceType,
    ServiceResourceBuilder,
    XacmlPolicyBuilder,
} from "../../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { RegisterSystemRequestBuilder, SystemRegisterBuildingBlocks, SystemRegisterClient, SystemRegisterDomainChecks } from "../../../authentication-imports.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
    ResourceDeleteResource,
} from "../../../building-blocks/resource-registry/resource/index.js";

/**
 * The service owner that owns the resource this test creates. The registry
 * compares the owner organization number against the consumer claim in the
 * token, so the two have to be the same. yt01 runs on a different org.
 */
const RESOURCE_OWNER_ORG = "ttd";
const RESOURCE_OWNER_ORG_NO = __ENV.ENVIRONMENT === "yt01" ? "713431400" : "991825827";

/**
 * The vendor that registers the system.
 */
const VENDOR_ORG_NO = "312605031";

/**
 * The action the system asks for on the resource. It has to be one the resource
 * policy grants, since a right on a system is a resource and action pair.
 */
const ACTION = "read";

const RESOURCE_TEXTS = {
    nb: "K6 systembrukerressurs",
    nn: "K6 systembrukarressurs",
    en: "K6 system user resource",
};

const CONTACT_POINT = {
    category: "Support",
    email: "noreply@digdir.no",
    telephone: "+4712345678",
    contactPage: "https://www.digdir.no",
};

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
 * Test: a resource created on the fly is usable as a right on a system.
 *
 * Nothing here leans on a resource somebody provisioned by hand. The test
 * creates a delegable generic resource, gives it a policy, registers a system
 * that asks for a right on it, and reads the right back the way a consumer sees
 * it. Both the system and the resource are removed again, so a passing run
 * leaves nothing behind.
 */
export default function () {
    const resourceTokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withOrganization(RESOURCE_OWNER_ORG)
            .withOrganizationNumber(RESOURCE_OWNER_ORG_NO)
            .withScopes(CreateScopeString([
                AltinnScopes.RESOURCEREGISTRY.RESOURCE.WRITE,
            ]))
            .build(),
    );

    const resourceClient = new ResourceClient(__ENV.BASE_URL, resourceTokenGenerator);

    // The vendor endpoints sit behind the system register scope, on the vendor org.
    const vendorTokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withOrganizationNumber(VENDOR_ORG_NO)
            .withScopes(CreateScopeString([
                AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE,
            ]))
            .build(),
    );

    const systemRegisterClient = new SystemRegisterClient(__ENV.BASE_URL, vendorTokenGenerator);

    // Reading the rights the way a consumer sees them wants the portal enduser
    // scope, not the vendor one.
    const enduserTokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withOrganization(RESOURCE_OWNER_ORG)
            .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
            .build(),
    );

    const enduserSystemRegisterClient = new SystemRegisterClient(__ENV.BASE_URL, enduserTokenGenerator);

    const resource = new ServiceResourceBuilder(`k6-systemuser-resource-${uuidv4()}`)
        .withTitle(RESOURCE_TEXTS)
        .withDescription(RESOURCE_TEXTS)
        .withRightDescription(RESOURCE_TEXTS)
        .withResourceType(ResourceType.GenericAccessResource)
        .withCompetentAuthority(RESOURCE_OWNER_ORG, RESOURCE_OWNER_ORG_NO, "Testdepartementet")
        .withContactPoint(CONTACT_POINT)
        .withStatus("Completed")
        .withAvailableForType([
            ResourcePartyType.LegalEntityEnterprise,
            ResourcePartyType.Company,
        ])
        .withDelegable(true)
        .withVisible(false)
        .withKeyword("k6")
        .build();

    const systemName = `K6-systemuser-resource-${uuidv4()}`;
    const systemId = `${VENDOR_ORG_NO}_${systemName}`;

    const rights = [
        {
            action: ACTION,
            resource: [
                {
                    id: "urn:altinn:resource",
                    value: resource.identifier,
                },
            ],
        },
    ];

    group("A system can be registered with a right on a resource created on the fly", function () {
        group("1. Create the resource", function () {
            if (!ResourceCreateResource(resourceClient, resource, { step: "1. Create the resource" })) {
                fail("cannot continue: the resource was not created");
            }
        });

        group("2. Publish the policy for the resource", function () {
            const policyFile = new XacmlPolicyBuilder(resource.identifier)
                .withRule({
                    roles: ["DAGL"],
                    actions: [ACTION],
                    description: "Roles that get access to the K6 system user resource",
                })
                .withMinimumAuthenticationLevel(3)
                .buildFile();

            if (!ResourceCreatePolicy(
                resourceClient,
                resource.identifier,
                policyFile,
                { step: "2. Publish the policy" },
            )) {
                fail("cannot continue: the policy was not published, so the resource has no rights to ask for");
            }
        });

        group("3. Register a system with a right on the resource", function () {
            const requestBody = new RegisterSystemRequestBuilder()
                .withName({
                    en: "K6 system user resource system",
                    nb: "K6 systembrukerressurs-system",
                    nn: "K6 systembrukarressurs-system",
                })
                .withAllowedRedirectUrls(["https://altinn.no"])
                .withClientId([uuidv4()])
                .withVendor(`0192:${VENDOR_ORG_NO}`)
                .withId(systemId)
                .withVisibility(false)
                .withDescription({
                    en: "Created by a K6 test to check that a resource created on the fly can be used as a right on a system.",
                    nb: "Opprettet av en K6-test for å sjekke at en ressurs opprettet underveis kan brukes som rettighet på et system.",
                    nn: "Oppretta av ein K6-test for å sjekke at ein ressurs oppretta undervegs kan brukast som rett på eit system.",
                })
                .withRights(rights)
                .build();

            const createdSystemId = SystemRegisterBuildingBlocks.VendorCreate(
                systemRegisterClient,
                requestBody,
            );

            if (createdSystemId === null) {
                fail("cannot continue: registering the system did not return a system id");
            }
        });

        group("4. The right on the system points at the resource", function () {
            const registeredRights = SystemRegisterBuildingBlocks.GetRightsFrontend(
                enduserSystemRegisterClient,
                systemId,
            );

            SystemRegisterDomainChecks.CheckRights(registeredRights, rights);
        });

        group("5. Delete the system", function () {
            const deleteResult = SystemRegisterBuildingBlocks.VendorDelete(systemRegisterClient, systemId);

            SystemRegisterDomainChecks.CheckUpdateSucceeded(deleteResult, "SystemRegisterVendorDelete");
        });

        group("6. Delete the resource", function () {
            ResourceDeleteResource(resourceClient, resource.identifier, { step: "6. Delete the resource" });
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
