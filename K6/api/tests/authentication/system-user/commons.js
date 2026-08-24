import { Right } from "../../../../clients/authentication/types.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { SystemUserClient } from "../../../authentication-imports.js";
import { arrangeApprovedSystemUser, pickVendor, resource } from "../change-request-system-user/commons.js";

/**
 * The rights the arranged system user is granted.
 *
 * Published in every environment these tests run in, so registering the system
 * works everywhere.
 *
 * @type {Right[]}
 */
const GRANTED_RIGHTS = [resource("k6-instancedelegation-test")];

/**
 * The scopes a vendor reads system users with.
 *
 * The vendor lookups are the two this folder tests: byquery sits behind the system
 * user request scope, and byExternalId behind the maskinporten lookup scope.
 */
const VENDOR_SCOPES = CreateScopeString([
    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.WRITE,
    AltinnScopes.MASKINPORTEN.SYSTEMUSER.READ,
]);

/**
 * @type {any | undefined}
 */
let clients = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let customerTokenGenerator = undefined;

/**
 * @type {EnterpriseTokenGenerator | undefined}
 */
let vendorTokenGenerator = undefined;

/**
 * Arranges the system user these tests read and update.
 *
 * Call from a test's setup. The flow that creates it is the subject of
 * create-and-confirm-system-user-request.js, so it stays out of these tests and is
 * reused from the change request tests, which arrange the same thing.
 *
 * @param {string} systemNamePrefix - Prefix for the generated system name, so systems are traceable to the test that made them.
 * @returns {any[]} A single arranged system user, as a list so a test picks from it with getItemFromList like any other test data.
 */
export function arrangeSystemUser(systemNamePrefix) {
    return arrangeApprovedSystemUser({
        systemNamePrefix,
        vendorOrgNo: pickVendor(),
        grantedRights: GRANTED_RIGHTS,
    });
}

/**
 * Creates and caches the clients these tests use.
 *
 * Built once per VU and reused across its iterations. The token generators cache
 * tokens per instance, so building them per iteration refetches every token from
 * the token generator service again.
 *
 * Updating a system user is the customer's own action on its own party, so it goes
 * with a personal token, while the two lookups are the vendor's and go with an
 * enterprise token. Neither is built for anyone in particular: who a run acts as is
 * decided by swapping the options with setTokenGeneratorOptions.
 *
 * @returns {[any, PersonalTokenGenerator, EnterpriseTokenGenerator]} Clients grouped by who they act as, and the two token generators.
 */
export function getClients() {
    if (clients === undefined) {
        customerTokenGenerator = new PersonalTokenGenerator(
            new PersonalTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
                .build(),
        );

        vendorTokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(VENDOR_SCOPES)
                .build(),
        );

        clients = {
            customer: {
                systemUserClient: new SystemUserClient(__ENV.BASE_URL, customerTokenGenerator),
            },
            vendor: {
                systemUserClient: new SystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
            },
        };
    }

    return [clients, customerTokenGenerator, vendorTokenGenerator];
}

/**
 * Token options for acting as the customer that owns the system user.
 *
 * @param {any} customer - The customer this iteration acts on behalf of.
 * @returns Options to hand to setTokenGeneratorOptions.
 */
export function getCustomerTokenOpts(customer) {
    return new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
        .withUserId(customer.userId)
        .withPartyUuid(customer.userPartyUuid)
        .build();
}

/**
 * Token options for acting as the vendor that owns the system.
 *
 * The scopes have to be repeated here, since the options replace the ones the
 * generator was built with rather than adding to them.
 *
 * @param {string} vendorOrgNo - Organisation number of the vendor this iteration acts as.
 * @returns Options to hand to setTokenGeneratorOptions.
 */
export function getVendorTokenOpts(vendorOrgNo) {
    return new EnterpriseTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(VENDOR_SCOPES)
        .withOrganizationNumber(vendorOrgNo)
        .build();
}

export { cleanupArranged } from "../change-request-system-user/commons.js";
