import { fail } from "k6";
import exec from "k6/execution";

import { ConnectionsClient, ServiceOwnerResourceDelegationBuilder } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, getNumberOfVUs, lazy, requireEnv, segmentData } from "../../../../../helpers.js";
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
 * @property {{[recipientType: string]: Array<Array<RecipientRow>>}} recipients
 * Parties a delegation is created to, grouped by recipient type and split into
 * one slice per VU.
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
 * The recipients are grouped by type and each group split into one slice per VU.
 * __ITER counts per VU, so every VU drawing from the same list would pick the
 * same recipient on the same iteration: a run with several VUs would write one
 * delegation many times over instead of many delegations, and report timings for
 * a load it never applied. Grouping before splitting matters just as much, since
 * the fixture lists all the organizations before all the persons and slicing it
 * by position alone leaves the later VUs holding no row of their own type.
 *
 * Service owners are deliberately left whole, since several VUs working the same
 * resource at once is the thing a smoke run is there to measure.
 *
 * @returns {ResourceDelegationTestData} Environment-specific test data.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const base = __ENV.TEST_DATA_BASE_URL
        ?? "access-management/service-owner/connections";

    const rows = fetchTestData(`${base}/recipients/${__ENV.ENVIRONMENT}.csv`);
    const vus = getNumberOfVUs();

    return {
        serviceOwners: fetchTestData(`${base}/service-owners/${__ENV.ENVIRONMENT}.csv`),
        recipients: {
            organization: sliceRecipients(rows, "organization", vus),
            person: sliceRecipients(rows, "person", vus),
        },
    };
}

/**
 * Keeps the recipients of one type and hands each VU its own slice of them.
 *
 * @param {Array<RecipientRow>} rows Every recipient in the fixture.
 * @param {"person"|"organization"} recipientType The type to keep.
 * @param {number} vus How many slices to cut.
 * @returns {Array<Array<RecipientRow>>} One slice per VU.
 */
function sliceRecipients(rows, recipientType, vus) {
    const recipients = rows.filter(
        (recipient) => recipient.recipientType === recipientType,
    );

    if (recipients.length < vus) {
        fail(
            `recipients/${__ENV.ENVIRONMENT}.csv has ${recipients.length} ${recipientType} rows,`
            + ` which is fewer than the ${vus} VUs asking for one each`,
        );
    }

    return segmentData(recipients, vus);
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
 * The recipients this VU delegates to.
 *
 * @param {ResourceDelegationTestData} data Environment-specific test data.
 * @param {"person"|"organization"} recipientType The recipient type under test.
 * @returns {Array<RecipientRow>} This VU's slice.
 */
export function recipientsForVu(data, recipientType) {
    return data.recipients[recipientType][exec.vu.idInTest - 1];
}

/**
 * Every recipient of one type, across all VUs.
 *
 * Teardown takes this rather than a single slice: it has to sweep what any VU
 * may have written, and it is not told which ones the run reached.
 *
 * @param {ResourceDelegationTestData} data Environment-specific test data.
 * @param {"person"|"organization"} recipientType The recipient type to sweep.
 * @returns {Array<RecipientRow>} Every matching recipient.
 */
export function allRecipients(data, recipientType) {
    return data.recipients[recipientType].flat();
}

/**
 * Builds the delegation request for one service owner and one recipient.
 *
 * The recipient decides which of the builder's typed party methods is used, so
 * the urn prefix is never spelled out at the call site. Shared with the teardown
 * below, which has to rebuild a request it never saw created.
 *
 * Takes the rights response as it arrives and picks the keys off it, so no test
 * has to know how a right carries its key.
 *
 * @param {ServiceOwnerRow} serviceOwner The service owner.
 * @param {RecipientRow} recipient The receiving party.
 * @param {Array<*>|null} [rights] The rights response for the resource, or null
 * to address the whole delegation, which is what revoking takes.
 * @returns {*} The delegation payload.
 */
export function delegationRequest(serviceOwner, recipient, rights = null) {
    const builder = new ServiceOwnerResourceDelegationBuilder()
        .WithFromOrganization(serviceOwner.fromOrganizationNumber)
        .WithResource(serviceOwner.resource);

    if (recipient.recipientType === "person") {
        builder.WithToPerson(recipient.recipientIdentifier);
    } else {
        builder.WithToOrganization(recipient.recipientIdentifier);
    }

    if (rights !== null) {
        builder.WithRightKeys({
            directRightKeys: rights
                .map((right) => right.key)
                .filter((key) => key !== null),
        });
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
 * k6 does not say which rows the run reached, so this sweeps the rows it could
 * have reached: a VU takes rows from the front of its slice, one per iteration,
 * so that prefix is the reach of the run. Sweeping the whole fixture instead
 * would mean 500 revokes after a functional run that created one delegation, and
 * would have a scheduled run tearing down what a manual one is still using.
 *
 * Each test sweeps only its own recipient type, so the two can run side by side
 * without touching each other.
 *
 * @param {ResourceDelegationTestData} data Environment-specific test data.
 * @param {"person"|"organization"} recipientType The recipient type to sweep.
 * @param {{[key: string]: string}} label k6 request label for the revoke step.
 * @returns {void}
 */
export function revokeDelegations(data, recipientType, label) {
    const { connections, tokenGenerator } = getClients();

    // Cast for the same reason getNumberOfVUs does it: Scenario is a union and
    // only some of its members carry vus and iterations.
    const scenario = /** @type {*} */ (exec.test.options.scenarios?.default);
    const vus = scenario?.vus ?? 1;
    const iterations = scenario?.iterations ?? 1;
    const perVu = scenario?.executor === "shared-iterations"
        ? Math.ceil(iterations / vus)
        : iterations;

    const touched = data.recipients[recipientType]
        .flatMap((slice) => slice.slice(0, perVu));

    data.serviceOwners.forEach((serviceOwner) => {
        tokenGenerator.setTokenGeneratorOptions(getServiceOwnerTokenOpts(serviceOwner));

        touched.forEach((recipient) => {
            ConnectionsRevokeResource(
                connections,
                delegationRequest(serviceOwner, recipient),
                label,
            );
        });
    });
}
