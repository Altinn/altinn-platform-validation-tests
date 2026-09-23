import { fail } from "k6";

import { ConnectionsClient, ServiceOwnerResourceDelegationBuilder } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, lazy, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { ConnectionsRevokeResource } from "../../../../building-blocks/access-management/service-owner/connections/index.js";

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
 * Loads the two fixtures the tests in this folder run on.
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

/**
 * Picks the recipients of one type out of the fixture.
 *
 * A functional run gets one iteration, so a test that drew from the whole
 * recipient list would only ever reach the first row. One test per type means
 * each one covers its own case whatever the iteration count is.
 *
 * @param {ResourceDelegationTestData} data Environment-specific test data.
 * @param {"person"|"organization"} recipientType The type to keep.
 * @returns {Array<RecipientRow>} The matching recipients.
 */
export function recipientsOfType(data, recipientType) {
    const recipients = data.recipients.filter(
        (recipient) => recipient.recipientType === recipientType,
    );

    if (recipients.length === 0) {
        fail(`No ${recipientType} recipient in recipients/${__ENV.ENVIRONMENT}.csv`);
    }

    return recipients;
}

/**
 * Builds the delegation request for one service owner and one recipient.
 *
 * The recipient decides which of the builder's typed party methods is used, so
 * the urn prefix is never spelled out at the call site. Shared with the teardown
 * below, which has to rebuild a request it never saw created.
 *
 * @param {ServiceOwnerRow} serviceOwner The service owner.
 * @param {RecipientRow} recipient The receiving party.
 * @param {Array<string>|null} [rightKeys] Right keys to delegate, or null to
 * address the whole delegation, which is what revoking takes.
 * @returns {*} The delegation payload.
 */
export function delegationRequest(serviceOwner, recipient, rightKeys = null) {
    const builder = new ServiceOwnerResourceDelegationBuilder()
        .WithFromOrganization(serviceOwner.fromOrganizationNumber)
        .WithResource(serviceOwner.resource);

    if (recipient.recipientType === "person") {
        builder.WithToPerson(recipient.recipientIdentifier);
    } else {
        builder.WithToOrganization(recipient.recipientIdentifier);
    }

    if (rightKeys !== null) {
        builder.WithRightKeys({ directRightKeys: rightKeys });
    }

    return builder.Build();
}

/**
 * Removes every delegation of the given recipient type a run may have left.
 *
 * k6 runs teardown once after all iterations, including when an iteration fails
 * partway through, which is the case the ordinary path cannot clean up after.
 * Revoke removes the complete resource delegation, so right keys are left off.
 *
 * This is the one place the fixture is walked rather than one row per iteration:
 * k6 does not tell teardown which rows the run reached, and revoking a
 * delegation that was never created costs one 204. Each test sweeps only its own
 * recipient type, so the two can run side by side without touching each other.
 *
 * @param {ResourceDelegationTestData} data Environment-specific test data.
 * @param {"person"|"organization"} recipientType The recipient type to sweep.
 * @param {{[key: string]: string}} label k6 request label for the revoke step.
 * @returns {void}
 */
export function revokeDelegations(data, recipientType, label) {
    const { connections, tokenGenerator } = getClients();

    data.serviceOwners.forEach((serviceOwner) => {
        tokenGenerator.setTokenGeneratorOptions(getServiceOwnerTokenOpts(serviceOwner));

        recipientsOfType(data, recipientType).forEach((recipient) => {
            ConnectionsRevokeResource(
                connections,
                delegationRequest(serviceOwner, recipient),
                label,
            );
        });
    });
}
