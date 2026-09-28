import { fail, group } from "k6";

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
    ResourceUpdateResource,
} from "../../building-blocks/resource-registry/resource/index.js";

/**
 * Publishes one resource per service owner in the service-owner delegation
 * fixture.
 *
 * A service owner can only delegate a resource it owns: the API checks the
 * caller against the resource owner, so sharing one resource across five service
 * owners would leave four of the rows failing.
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
 * Rerunning is safe: a resource that is already there is updated rather than
 * created again, so a change to the contact point or the policy reaches the
 * environments without anyone deleting anything first. Deleting is what this
 * deliberately does not do - it leaves rows behind in
 * resourceregistry.resourcesubjects, reported as
 * Altinn/altinn-resource-registry#848.
 */

// One service owner per row in service-owners/<env>.csv. Synthetic Tenor
// organisations would be preferable, but the delegation endpoint will not take
// one: it answers AM-00048 unless the caller is an orgcode registered in the
// Altinn org list, and every registered orgcode but ttd is bound to its own real
// organisation number. ttd accepts any number in the resource registry, having
// none of its own, but the delegation endpoint rejects ttd for the same reason.
//
// So these are real orgcodes, picked to stay away from the recognisable public
// authorities: digdir and its own Digdir Labs test organisation first, then
// three smaller ones. Delegating in a test environment on behalf of, say,
// Skatteetaten is the thing worth avoiding.
//
// Being in the org list is not enough on its own either: the org also has to
// exist as a party in the environment, and most of the 107 published ones do
// not. Check a replacement first, by delegating from its organisation number
// against an existing resource and seeing whether the create is accepted.
/**
 * @typedef {object} ServiceOwner
 * @property {string} orgcode Service owner code the token acts as.
 * @property {string} orgno Organization number the registry validates against.
 * @property {string} name Owner name, as the resource reports it.
 */

/** @type {{[environment: string]: Array<ServiceOwner>}} */
const SERVICE_OWNERS_BY_ENVIRONMENT = {
    at22: [
        { orgcode: "ddlabs", orgno: "310797510", name: "Digdir Labs" },
        { orgcode: "bits", orgno: "916960190", name: "BITS AS" },
        { orgcode: "din", orgno: "984195796", name: "DIN" },
        { orgcode: "kv", orgno: "971040238", name: "KV" },
    ],
    // Not the same set: which orgs exist as parties differs per environment, and
    // bits, din and kv are not parties in at23. Seven orgs are, and dropping brg
    // and skd leaves exactly these four alongside digdir.
    //
    // nsm is here to make up the five, not because it is any less recognisable
    // than the two left out - at23 simply has nothing else to reach five with.
    // Four service owners would exercise the same thing, so drop it if having a
    // security authority in the fixture reads worse than the shorter list.
    at23: [
        { orgcode: "ddlabs", orgno: "310797510", name: "Digdir Labs" },
        { orgcode: "staf", orgno: "921627009", name: "Statsforvalterens fellestjenester" },
        { orgcode: "slk", orgno: "960885406", name: "Statens Lånekasse for utdanning" },
        { orgcode: "nsm", orgno: "985165262", name: "Nasjonal sikkerhetsmyndighet" },
    ],
};

const SERVICE_OWNERS = SERVICE_OWNERS_BY_ENVIRONMENT[__ENV.ENVIRONMENT] ?? [];
// example.com is reserved by RFC 2606 and routes nowhere, so nothing a test
// resource publishes can reach a real inbox or page. digdir.no would.
const CONTACT_POINT = {
    category: "Support",
    email: "k6-tests@example.com",
    telephone: "+4712345678",
    contactPage: "https://example.com/k6-tests",
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

    if (SERVICE_OWNERS.length === 0) {
        fail(
            `No service owners listed for ${__ENV.ENVIRONMENT}. Add them to`
            + " SERVICE_OWNERS_BY_ENVIRONMENT, after checking each one is a party in"
            + " that environment.",
        );
    }

    return;
}

/**
 * A resource-registry client acting as one service owner.
 *
 * Built per service owner rather than cached: the registry compares the resource
 * owner organization number against the consumer claim on the token, so each
 * resource has to be written with its own owner's token.
 *
 * @param {{orgcode: string, orgno: string, name: string}} serviceOwner The owner to act as.
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

            // POST refuses an identifier that is taken, so an existing resource
            // is updated instead. Reading it back first is what tells the two
            // apart. Straight off the client rather than through the building
            // block: a resource that is not there yet is the ordinary case on a
            // first run, and should not report a failed check for it.
            const exists = resourceClient.ResourceGetResource(
                identifier,
                null,
                { step: `${step}. Read ${identifier}` },
            ).status === 200;

            const written = exists
                ? ResourceUpdateResource(
                    resourceClient,
                    identifier,
                    resource,
                    { step: `${step}. Update ${identifier}` },
                )
                : ResourceCreateResource(
                    resourceClient,
                    resource,
                    { step: `${step}. Create ${identifier}` },
                );

            // The policy is what gives the resource delegable rights, so a
            // resource that could not be written has nothing to publish against.
            if (!written) {
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

            // No create-or-update split here: the policy endpoint answers 201 to
            // a POST whether or not a policy is already stored, and replaces it
            // either way.
            ResourceCreatePolicy(
                resourceClient,
                identifier,
                policyFile,
                { step: `${step}. Publish policy for ${identifier}` },
            );
        });
    });
}
