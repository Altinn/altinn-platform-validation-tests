import {
    ResourceAccessListMode,
    ResourceClient,
    ResourcePartyType,
    ResourceType,
    ServiceResourceBuilder,
    XacmlPolicyBuilder,
} from "../../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { lazy } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";

/**
 * The resources the tests in this folder run against, and how they are written
 * to the resource registry.
 *
 * Shared by the script that provisions them and by the propagation test, which
 * rewrites one of them with the delegable flag flipped. A PUT replaces the whole
 * resource, so both have to build exactly the same body or the test would change
 * more than the one flag it is about.
 */

/**
 * Owner of the resources. Digdir, the same owner as
 * k6-serviceowner-resource-delegation, so the service owner tests here can reuse
 * the digdir row of the service-owner connections fixture.
 */
export const OWNER = Object.freeze({
    orgcode: "digdir",
    orgno: "991825827",
    name: "Digitaliseringsdirektoratet",
});

/**
 * A resource marked as not delegable. Never changed after it is provisioned, so
 * every endpoint that should refuse it can be asked at any time.
 */
export const NOT_DELEGABLE_RESOURCE = "k6-not-delegable-resource";

/**
 * A delegable resource, never changed after it is provisioned. The counterpart
 * of NOT_DELEGABLE_RESOURCE: if Access Management's copy wrongly marked every
 * resource as not delegable, the refusal tests would all still pass, and only a
 * test that expects a yes would notice.
 */
export const DELEGABLE_RESOURCE = "k6-delegable-resource";

/**
 * A resource whose delegable flag the propagation test flips back and forth.
 * Kept apart from the one above, so a propagation run that dies halfway cannot
 * leave the negative test with a resource in the wrong state.
 */
export const DELEGABLE_TOGGLE_RESOURCE = "k6-delegable-toggle-resource";

/**
 * A delegable resource with access lists enforced. Being delegable, an
 * organization on one of its lists gets every right and one that is not gets
 * none, so the access list is the only thing that tells them apart. That is why
 * it is used rather than k6-tilgangsliste-test, which is also not delegable. The
 * lists themselves are created and deleted by access-list-membership.js.
 */
export const DELEGABLE_ACCESS_LIST_RESOURCE = "k6-access-list-resource";

// example.com is reserved by RFC 2606 and routes nowhere, so nothing a test
// resource publishes can reach a real inbox or page.
const CONTACT_POINT = {
    category: "Support",
    email: "k6-tests@example.com",
    telephone: "+4712345678",
    contactPage: "https://example.com/k6-tests",
};

// Matches the policy on k6-serviceowner-resource-delegation. The daglig leder
// the enduser tests act as holds DAGL, so the only thing standing between them
// and a delegable right is the flag under test.
const ROLES = ["DAGL", "REGNA"];
const ACCESS_PACKAGES = ["jordbruk"];
const ACTIONS = ["read", "write"];
const MINIMUM_AUTHENTICATION_LEVEL = 3;

const AVAILABLE_FOR_TYPE = [
    ResourcePartyType.PrivatePerson,
    ResourcePartyType.LegalEntityEnterprise,
    ResourcePartyType.Company,
    ResourcePartyType.BankruptcyEstate,
];

/**
 * Builds one of the resources.
 *
 * @param {string} identifier Resource identifier.
 * @param {boolean} delegable Whether the resource is delegable.
 * @param {import("../../../../clients/resource-registry/types.js").ResourceAccessListMode} [accessListMode] Disabled unless given.
 * @returns {import("../../../../clients/resource-registry/types.js").ServiceResource} The resource.
 */
export function buildResource(identifier, delegable, accessListMode = ResourceAccessListMode.Disabled) {
    const text = `K6 local resource data, ${identifier}`;

    return new ServiceResourceBuilder(identifier)
        .withTitle(text)
        .withDescription(text)
        .withRightDescription(text)
        .withResourceType(ResourceType.GenericAccessResource)
        .withCompetentAuthority(OWNER.orgcode, OWNER.orgno, OWNER.name)
        .withContactPoint(CONTACT_POINT)
        .withStatus("Completed")
        .withDelegable(delegable)
        .withAccessListMode(accessListMode)
        .withVisible(false)
        .withAvailableForType(AVAILABLE_FOR_TYPE)
        .withKeyword("k6")
        .build();
}

/**
 * Builds the policy file for one of the resources.
 *
 * @param {string} identifier Resource identifier.
 * @returns {*} The policy file, ready for ResourceCreatePolicy.
 */
export function buildPolicyFile(identifier) {
    return new XacmlPolicyBuilder(identifier)
        .withRule({
            roles: ROLES,
            accessPackages: ACCESS_PACKAGES,
            actions: ACTIONS,
            description: "Roles and access packages that get access to the resource",
        })
        .withMinimumAuthenticationLevel(MINIMUM_AUTHENTICATION_LEVEL)
        .buildFile();
}

/**
 * A resource registry client acting as the owner. The registry compares the
 * resource owner against the consumer claim on the token, so the resources can
 * only be written with the owner's own token.
 *
 * @returns {ResourceClient} The client.
 */
export const getOwnerResourceClient = lazy(function () {
    const tokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withOrganization(OWNER.orgcode)
            .withOrganizationNumber(OWNER.orgno)
            .withScopes(CreateScopeString([
                AltinnScopes.RESOURCEREGISTRY.RESOURCE.WRITE,
            ]))
            .build(),
    );

    return new ResourceClient(__ENV.BASE_URL, tokenGenerator);
});
