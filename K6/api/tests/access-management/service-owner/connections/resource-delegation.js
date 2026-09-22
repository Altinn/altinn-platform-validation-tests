import { fail, group } from "k6";

import { ConnectionsClient, GetResourceRightsQueryBuilder, ServiceOwnerResourceDelegationBuilder } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, getItemFromList, getOptions, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { ConnectionsCreateResource, ConnectionsGetResourceRights, ConnectionsRevokeResource } from "../../../../building-blocks/access-management/service-owner/connections/index.js";

const getRightsLabel = { step: "1. Get resource rights" };
const createDelegationLabel = { step: "2. Create resource delegation" };
const revokeDelegationLabel = { step: "3. Revoke resource delegation" };

export const options = getOptions([
    getRightsLabel,
    createDelegationLabel,
    revokeDelegationLabel,
]);

/**
 * @typedef {object} ResourceDelegationTestData
 * @property {string} serviceOwnerOrg Service owner organization code.
 * @property {string} serviceOwnerOrgNo Service owner organization number.
 * @property {string} fromOrganizationNumber Tenor organization delegating the resource.
 * @property {string} toOrganizationNumber Tenor organization receiving the resource.
 * @property {string} resource Resource identifier.
 */

/**
 * @returns {Array<ResourceDelegationTestData>} Environment-specific test data.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return fetchTestData(
        __ENV.TEST_DATA_URL
        ?? `access-management/service-owner/connections/${__ENV.ENVIRONMENT}.csv`,
    );
}

/** @type {ConnectionsClient|null} */
let connectionsClient = null;
let currentServiceOwner = "";

/**
 * @param {ResourceDelegationTestData} testData Service owner configuration.
 * @returns {ConnectionsClient} The initialized API client.
 */
function getClient(testData) {
    const serviceOwner = `${testData.serviceOwnerOrg}:${testData.serviceOwnerOrgNo}`;

    if (connectionsClient !== null && currentServiceOwner === serviceOwner) {
        return connectionsClient;
    }

    const tokenOpts = new EnterpriseTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(CreateScopeString([
            AltinnScopes.SERVICEOWNER.DELEGATIONS.RESOURCE.WRITE,
        ]))
        .withOrganization(testData.serviceOwnerOrg)
        .withOrganizationNumber(testData.serviceOwnerOrgNo)
        .build();

    connectionsClient = new ConnectionsClient(
        __ENV.BASE_URL,
        new EnterpriseTokenGenerator(tokenOpts),
    );
    currentServiceOwner = serviceOwner;

    return connectionsClient;
}

/**
 * Tests the complete service owner resource delegation lifecycle.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 */
export default function (data) {
    const testData = getItemFromList(data, true);
    const client = getClient(testData);

    group("Service owner resource delegation", function () {
        const rights = ConnectionsGetResourceRights(
            client,
            new GetResourceRightsQueryBuilder()
                .WithResource(testData.resource)
                .Build(),
            getRightsLabel,
        );
        const rightKeys = rights
            .map((right) => right.key)
            .filter((key) => key !== null);

        if (rightKeys.length === 0) {
            fail(`No rights found for resource ${testData.resource}`);
        }

        const request = new ServiceOwnerResourceDelegationBuilder()
            .WithFrom(
                `urn:altinn:organization:identifier-no:${testData.fromOrganizationNumber}`,
            )
            .WithTo(
                `urn:altinn:organization:identifier-no:${testData.toOrganizationNumber}`,
            )
            .WithResource(testData.resource)
            .WithRightKeys({ directRightKeys: rightKeys })
            .Build();

        const assignment = ConnectionsCreateResource(
            client,
            request,
            createDelegationLabel,
        );

        if (assignment === null) {
            fail("Resource delegation was not created");
        }

        ConnectionsRevokeResource(
            client,
            request,
            revokeDelegationLabel,
        );
    });
}
