import { group } from "k6";

import { RequestSystemUserClient, SystemRegisterClient } from "../../../clients/authentication/index.js";
import {
    ResourceClient,
    ResourcePartyType,
    ResourceType,
    ServiceResourceBuilder,
} from "../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, uuidv4 } from "../../../common-imports.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import { RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks } from "../../authentication-imports.js";

/**
 * Deletes the systems a test left in a vendor's register.
 *
 * Call from a test's teardown. A test that registers a system deletes it again as
 * part of what it does, but only on the way it was meant to go: a step that calls
 * fail() skips everything after it, and then the system stays in the register.
 * Sweeping in the teardown covers that without every test having to carry its own
 * unwinding, and it also picks up what an earlier run left behind.
 *
 * Matching on the name prefix rather than on ids collected while the test ran,
 * since k6 runs the teardown in its own context and nothing a virtual user built
 * up reaches it. That is also why the prefix has to be unique per test: two tests
 * sharing one would delete each other's systems while they run in parallel.
 *
 * @param {SystemRegisterClient} systemRegisterClient - Client authenticated as the vendor that owns the systems.
 * @param {string} vendorOrgNo - Organisation number of that vendor, which every system id starts with.
 * @param {string} systemNamePrefix - The prefix the test names its systems with.
 * @param {RequestSystemUserClient} [requestSystemUserClient] - Client for the requests, for a test that makes them. Pass it and the pending requests on a leftover system go too.
 * @returns {number} How many systems were swept up.
 */
export function sweepRegisteredSystems(systemRegisterClient, vendorOrgNo, systemNamePrefix, requestSystemUserClient = null) {
    let swept = 0;

    group(`Teardown - remove the systems left in the register by ${systemNamePrefix}`, function () {
        const prefix = `${vendorOrgNo}_${systemNamePrefix}`;

        const leftovers = (SystemRegisterBuildingBlocks.VendorGet(systemRegisterClient) ?? [])
            .filter((system) => `${system?.systemId}`.startsWith(prefix));

        for (const system of leftovers) {
            if (requestSystemUserClient !== null) {
                sweepPendingRequests(requestSystemUserClient, system.systemId);
            }

            SystemRegisterBuildingBlocks.VendorDelete(systemRegisterClient, system.systemId);
        }

        swept = leftovers.length;

        if (swept > 0) {
            console.info(`sweepRegisteredSystems - removed ${swept} system(s) matching ${prefix}`);
        }
    });

    return swept;
}

/**
 * Withdraws the requests still pending on a system.
 *
 * A system that is about to be swept away can still carry requests nobody acted
 * on, which is what a run that failed at the approval leaves behind. Only the ones
 * still waiting are withdrawn: an accepted request has become a system user and is
 * that system user's business, and asking to delete it only answers an error.
 *
 * Both kinds are listed, since agent requests live on their own endpoint and a
 * system can hold either. Only the first page of each: a system this test made
 * carries one request per run, so a second page means something other than
 * leftovers.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient - Client authenticated as the vendor that made the requests.
 * @param {string} systemId - The system whose requests are withdrawn.
 * @returns {number} How many requests were withdrawn.
 */
function sweepPendingRequests(requestSystemUserClient, systemId) {
    const pending = [
        ...(RequestSystemUserBuildingBlocks.VendorGetBySystem(requestSystemUserClient, systemId)?.data ?? []),
        ...(RequestSystemUserBuildingBlocks.VendorAgentGetBySystem(requestSystemUserClient, systemId)?.data ?? []),
    ].filter((request) => request?.status === "New");

    for (const request of pending) {
        RequestSystemUserBuildingBlocks.VendorDelete(requestSystemUserClient, request.id);
    }

    if (pending.length > 0) {
        console.info(`sweepPendingRequests - withdrew ${pending.length} pending request(s) on ${systemId}`);
    }

    return pending.length;
}

/**
 * The service owner that owns the resource the resource flow creates. The registry
 * compares the owner organization number against the consumer claim in the token,
 * so the two have to be the same. yt01 runs on a different org.
 */
const RESOURCE_OWNER_ORG = "ttd";
const RESOURCE_OWNER_ORG_NO = __ENV.ENVIRONMENT === "yt01" ? "713431400" : "991825827";

/**
 * The vendor the resource flow registers its system as. Not read from vendors.csv
 * like pickVendor does, since this flow needs no Maskinporten client of its own.
 */
export const RESOURCE_FLOW_VENDOR_ORG_NO = "312605031";

/**
 * The clients the resource flow acts with.
 *
 * @typedef {object} ResourceFlowClients
 * @property {{resourceClient: ResourceClient}} resourceOwner The service owner that owns the resource.
 * @property {{systemRegisterClient: SystemRegisterClient}} vendor The vendor that registers the system.
 * @property {{systemRegisterClient: SystemRegisterClient}} enduser The consumer view of the system.
 */

/**
 * @type {ResourceFlowClients | undefined}
 */
let resourceFlowClients = undefined;

/**
 * Creates and caches the clients the resource flow uses.
 *
 * Separate from getClients above, which hands out the vendor lookups the read
 * tests share. These three cannot share a token: the registry only lets the
 * resource owner write, the vendor endpoints sit behind the system register scope
 * on the vendor org, and reading the rights the way a consumer sees them wants
 * the portal enduser scope.
 *
 * @returns {ResourceFlowClients} Clients grouped by who they act as.
 */
export function getResourceFlowClients() {
    if (resourceFlowClients === undefined) {
        const resourceOwnerTokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withOrganization(RESOURCE_OWNER_ORG)
                .withOrganizationNumber(RESOURCE_OWNER_ORG_NO)
                .withScopes(CreateScopeString([
                    AltinnScopes.RESOURCEREGISTRY.RESOURCE.WRITE,
                ]))
                .build(),
        );

        const vendorTokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withOrganizationNumber(RESOURCE_FLOW_VENDOR_ORG_NO)
                .withScopes(CreateScopeString([
                    AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE,
                ]))
                .build(),
        );

        const enduserTokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withOrganization(RESOURCE_OWNER_ORG)
                .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
                .build(),
        );

        resourceFlowClients = {
            resourceOwner: {
                resourceClient: new ResourceClient(__ENV.BASE_URL, resourceOwnerTokenGenerator),
            },
            vendor: {
                systemRegisterClient: new SystemRegisterClient(__ENV.BASE_URL, vendorTokenGenerator),
            },
            enduser: {
                systemRegisterClient: new SystemRegisterClient(__ENV.BASE_URL, enduserTokenGenerator),
            },
        };
    }

    return resourceFlowClients;
}

/**
 * Builds a delegable generic resource, owned by the service owner the resource
 * client authenticates as.
 *
 * @param {string} identifierPrefix - Prefix for the generated identifier, so
 * resources are traceable to the test that made them. Only a-z, 0-9, _ and -.
 * @returns {import("../../../clients/resource-registry/types.js").ServiceResource} The resource payload.
 */
export function createResourcePayload(identifierPrefix) {
    const texts = {
        nb: "K6 systembrukerressurs",
        nn: "K6 systembrukarressurs",
        en: "K6 system user resource",
    };

    return new ServiceResourceBuilder(`${identifierPrefix}${uuidv4()}`)
        .withTitle(texts)
        .withDescription(texts)
        .withRightDescription(texts)
        .withResourceType(ResourceType.GenericAccessResource)
        .withCompetentAuthority(RESOURCE_OWNER_ORG, RESOURCE_OWNER_ORG_NO, "Testdepartementet")
        .withContactPoint({
            category: "Support",
            email: "noreply@digdir.no",
            telephone: "+4712345678",
            contactPage: "https://www.digdir.no",
        })
        .withStatus("Completed")
        .withAvailableForType([
            ResourcePartyType.LegalEntityEnterprise,
            ResourcePartyType.Company,
        ])
        .withDelegable(true)
        .withVisible(false)
        .withKeyword("k6")
        .build();
}
