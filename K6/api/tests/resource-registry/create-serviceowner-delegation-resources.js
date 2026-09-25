import { group } from "k6";

import {
    ResourceClient,
    ResourcePartyType,
    ResourceType,
    ServiceResourceBuilder,
    XacmlPolicyBuilder,
} from "../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../common-imports.js";
import { requireEnv } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
} from "../../building-blocks/resource-registry/resource/index.js";

/**
 * Publishes one resource per service owner in the service-owner delegation
 * fixture.
 *
 * `k6-serviceowner-resource-delegation` already exists and is digdir's row in
 * testdata/access-management/service-owner/connections/service-owners/<env>.csv.
 * This adds one for each of the other service owners in that fixture, since a
 * service owner can only delegate a resource it owns: the API checks the caller
 * against the resource owner, so sharing one resource across five service owners
 * would leave four of the rows failing.
 *
 * Every resource here is a plain delegable one. The variants that deliberately
 * refuse a delegation belong in a negative test, not in a fixture the smoke test
 * draws from at random: half the iterations would fail by design and the numbers
 * would say nothing.
 *
 * Deliberately left out of run-all.js and given no delete step. Run it once per
 * environment, on purpose, with
 * `k6 run K6/api/tests/resource-registry/create-serviceowner-delegation-resources.js`.
 *
 * ResourceCreateResource only succeeds on an identifier that is free, so a
 * rerun reports failures for the resources that already exist. That is expected.
 */

// One service owner per row in service-owners/<env>.csv, minus digdir, which
// already owns k6-serviceowner-resource-delegation. Organization numbers are the
// ones the Altinn org list publishes, and the registry validates them against
// the consumer claim on the token, so they have to match exactly.
//
// Being in that list is not enough on its own: the delegation endpoint answers
// AM-00023 for a service owner that is not also a party in the environment, and
// most of the 107 published orgs are not. These four are, in at22. Check a
// replacement before adding it, by delegating from its organization number and
// seeing whether the create is accepted.
const SERVICE_OWNERS = [
    { orgcode: "skd", orgno: "974761076", name: "Skatteetaten" },
    { orgcode: "brg", orgno: "974760673", name: "Brønnøysundregistrene" },
    { orgcode: "nb", orgno: "937884117", name: "Norges Bank" },
    { orgcode: "fd", orgno: "971203420", name: "Fiskeridirektoratet" },
];

const CONTACT_POINT = {
    category: "Support",
    email: "noreply@digdir.no",
    telephone: "+4712345678",
    contactPage: "https://www.digdir.no",
};

// Matches the policy on k6-serviceowner-resource-delegation, so every row in the
// fixture hands out the same rights and one row is not slower than the next for
// reasons the test cannot see.
const ROLES = ["DAGL", "REGNA"];
const ACCESS_PACKAGES = ["jordbruk"];
const ACTIONS = ["read", "write"];
const MINIMUM_AUTHENTICATION_LEVEL = 3;

// Both the organization and the person test draw from the same fixture rows, so
// every resource has to accept both. The original lists only the two
// organization types and takes a person delegation anyway, but these say so.
const AVAILABLE_FOR_TYPE = [
    ResourcePartyType.PrivatePerson,
    ResourcePartyType.LegalEntityEnterprise,
    ResourcePartyType.Company,
    ResourcePartyType.BankruptcyEstate,
];

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
 * A resource-registry client acting as one service owner.
 *
 * Built per service owner rather than cached: the registry compares the resource
 * owner organization number against the consumer claim on the token, so each
 * resource has to be written with its own owner's token.
 *
 * @param {{orgcode: string, orgno: string}} serviceOwner The owner to act as.
 * @returns {ResourceClient} The client.
 */
function resourceClientFor(serviceOwner) {
    const tokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withOrganization(serviceOwner.orgcode)
            .withOrganizationNumber(serviceOwner.orgno)
            .withScopes(CreateScopeString([
                AltinnScopes.RESOURCEREGISTRY.RESOURCE.WRITE,
            ]))
            .build(),
    );

    return new ResourceClient(__ENV.BASE_URL, tokenGenerator);
}

export default function () {
    SERVICE_OWNERS.forEach((serviceOwner, index) => {
        const step = index + 1;
        const identifier = `k6-serviceowner-resource-delegation-${serviceOwner.orgcode}`;

        group(`Resource ${step}: ${identifier}`, () => {
            const resourceClient = resourceClientFor(serviceOwner);
            const text = `K6 service owner resource delegation, ${serviceOwner.name}`;

            const resource = new ServiceResourceBuilder(identifier)
                .withTitle(text)
                .withDescription(text)
                .withRightDescription(text)
                .withResourceType(ResourceType.GenericAccessResource)
                .withCompetentAuthority(serviceOwner.orgcode, serviceOwner.orgno, serviceOwner.name)
                .withContactPoint(CONTACT_POINT)
                .withStatus("Completed")
                .withDelegable(true)
                .withVisible(false)
                .withAvailableForType(AVAILABLE_FOR_TYPE)
                .withKeyword("k6")
                .build();

            const created = ResourceCreateResource(
                resourceClient,
                resource,
                { step: `${step}. Create ${identifier}` },
            );

            // The policy is what gives the resource delegable rights, so a
            // resource whose create failed has nothing to publish against.
            if (!created) {
                return;
            }

            const policyFile = new XacmlPolicyBuilder(identifier)
                .withRule({
                    roles: ROLES,
                    accessPackages: ACCESS_PACKAGES,
                    actions: ACTIONS,
                    description: "Roles and access packages that get access to the resource",
                })
                .withMinimumAuthenticationLevel(MINIMUM_AUTHENTICATION_LEVEL)
                .buildFile();

            ResourceCreatePolicy(
                resourceClient,
                identifier,
                policyFile,
                { step: `${step}. Publish policy for ${identifier}` },
            );
        });
    });
}
