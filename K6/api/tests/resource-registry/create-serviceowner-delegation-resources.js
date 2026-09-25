import { group } from "k6";

import {
    ResourceClient,
    ResourcePartyType,
    ResourceType,
    ServiceResourceBuilder,
    XacmlPolicyBuilder,
} from "../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../common-imports.js";
import { lazy, requireEnv } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
} from "../../building-blocks/resource-registry/resource/index.js";

/**
 * Publishes the extra resources the service-owner delegation smoke test spreads
 * its load over.
 *
 * `k6-serviceowner-resource-delegation` already exists and is row one of
 * testdata/access-management/service-owner/connections/service-owners/<env>.csv.
 * This adds four more just like it, so that fixture can hold five rows and a run
 * is not hammering a single resource unless it means to.
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

const DIGDIR_ORG = "digdir";
const DIGDIR_ORGNO = "991825827";

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

const IDENTIFIERS = [
    "k6-serviceowner-resource-delegation-2",
    "k6-serviceowner-resource-delegation-3",
    "k6-serviceowner-resource-delegation-4",
    "k6-serviceowner-resource-delegation-5",
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
 * Creates and caches the client this script writes with.
 *
 * The registry compares the resource owner organization number against the
 * consumer claim on the token, so this has to be digdir to write a digdir
 * resource.
 *
 * @returns {ResourceClient} The client.
 */
const getResourceClient = lazy(function () {
    const tokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withOrganization(DIGDIR_ORG)
            .withOrganizationNumber(DIGDIR_ORGNO)
            .withScopes(CreateScopeString([
                AltinnScopes.RESOURCEREGISTRY.RESOURCE.WRITE,
            ]))
            .build(),
    );

    return new ResourceClient(__ENV.BASE_URL, tokenGenerator);
});

export default function () {
    const resourceClient = getResourceClient();

    IDENTIFIERS.forEach((identifier, index) => {
        const step = index + 1;

        group(`Resource ${step}: ${identifier}`, () => {
            const text = `K6 service owner resource delegation ${step + 1}`;

            const resource = new ServiceResourceBuilder(identifier)
                .withTitle(text)
                .withDescription(text)
                .withRightDescription(text)
                .withResourceType(ResourceType.GenericAccessResource)
                .withCompetentAuthority(DIGDIR_ORG, DIGDIR_ORGNO, "Digitaliseringsdirektoratet")
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
