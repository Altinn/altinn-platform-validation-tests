import { ConnectionsClient } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, lazy, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

const SERVICE_OWNER_SCOPES = CreateScopeString([
    AltinnScopes.SERVICEOWNER.DELEGATIONS.RESOURCE.WRITE,
]);

/**
 * @typedef {object} ServiceOwnerRow
 * @property {string} serviceOwnerOrg Service owner organization code.
 * @property {string} serviceOwnerOrgNo Service owner organization number.
 * @property {string} resource Resource identifier the service owner owns.
 * @property {string} fromOrganizationNumber Organization the resource is delegated from.
 */

/**
 * @typedef {object} RecipientRow
 * @property {"person"|"organization"} recipientType What kind of party the recipient is.
 * @property {string} recipientIdentifier National identity number or organization number.
 */

/**
 * @typedef {object} ResourceDelegationTestData
 * @property {Array<ServiceOwnerRow>} serviceOwners Service owners and the resource each one owns.
 * @property {Array<RecipientRow>} recipients Parties a delegation is created to.
 */

/**
 * Loads the two fixtures this test runs on.
 *
 * Both are read over HTTP rather than off disk: fetchTestData pulls them from
 * raw.githubusercontent.com pinned to main, so a fixture has to be merged before
 * a run can see it. That is what TEST_DATA_BASE_URL is for, pointing the two
 * reads at a local file server or a branch while the fixture is still in review.
 *
 * Kept in two files so service owners and recipients grow independently: adding
 * a service owner does not touch the recipient list, and adding a recipient
 * applies to every service owner.
 *
 * @returns {ResourceDelegationTestData} Environment-specific test data.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const base = __ENV.TEST_DATA_BASE_URL
        ?? "access-management/service-owner/connections";

    return {
        serviceOwners: fetchTestData(`${base}/service-owners/${__ENV.ENVIRONMENT}.csv`),
        recipients: fetchTestData(`${base}/recipients/${__ENV.ENVIRONMENT}.csv`),
    };
}

/**
 * Creates and caches the client and its token generator once per k6 runtime.
 *
 * The client is built for nobody in particular: which service owner a run acts
 * as is decided per iteration by swapping the options with
 * setTokenGeneratorOptions and getServiceOwnerTokenOpts. BaseTokenGenerator keys
 * its cache on the option set, so several service owners cost one token each
 * without the client being rebuilt.
 *
 * @returns {{connections: ConnectionsClient, tokenGenerator: EnterpriseTokenGenerator}} The client and its token generator.
 */
export const getClients = lazy(function () {
    const tokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(SERVICE_OWNER_SCOPES)
            .build(),
    );

    return {
        connections: new ConnectionsClient(__ENV.BASE_URL, tokenGenerator),
        tokenGenerator,
    };
});

/**
 * Token options for acting as one service owner.
 *
 * The scopes have to be repeated here, since the options replace the ones the
 * generator was built with rather than adding to them.
 *
 * @param {ServiceOwnerRow} serviceOwner The service owner this iteration acts as.
 * @returns {*} Options to hand to setTokenGeneratorOptions.
 */
export function getServiceOwnerTokenOpts(serviceOwner) {
    return new EnterpriseTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(SERVICE_OWNER_SCOPES)
        .withOrganization(serviceOwner.serviceOwnerOrg)
        .withOrganizationNumber(serviceOwner.serviceOwnerOrgNo)
        .build();
}
