import { Right } from "../../../../clients/authentication/types.js";
import {
    ResourceClient,
    ResourcePartyType,
    ResourceType,
    ServiceResourceBuilder,
} from "../../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { lazy } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { SystemRegisterClient, SystemUserClient } from "../../../authentication-imports.js";
import { arrangeApprovedSystemUser, pickVendor, resource } from "../change-request-system-user/commons.js";

/**
 * The resource the arranged system user is granted a right on.
 *
 * Published in every environment these tests run in, so registering the system
 * works everywhere.
 *
 * @type {string}
 */
export const GRANTED_RESOURCE = "k6-instancedelegation-test";

/**
 * The rights the arranged system user is granted.
 *
 * @type {Right[]}
 */
const GRANTED_RIGHTS = [resource(GRANTED_RESOURCE)];

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
 * @typedef {import("../change-request-system-user/commons.js").ArrangedSystemUser} ArrangedSystemUser
 */

/**
 * The clients the read tests act with.
 *
 * @typedef {object} VendorClients
 * @property {{systemUserClient: SystemUserClient}} vendor The vendor that looks its own system users up.
 */

/**
 * Arranges the system user these tests read.
 *
 * Call from a test's setup. The flow that creates it is the subject of
 * create-and-confirm-system-user-request.js, so it stays out of these tests and is
 * reused from the change request tests, which arrange the same thing.
 *
 * @param {string} systemNamePrefix - Prefix for the generated system name, so systems are traceable to the test that made them.
 * @returns {ArrangedSystemUser[]} A single arranged system user, as a list so a test picks from it with getItemFromList like any other test data.
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
 * The two lookups are the vendor's own, so there is one enterprise token and no
 * personal one. It is not built for anyone in particular: which vendor a run acts
 * as is decided by swapping the options with setTokenGeneratorOptions.
 *
 * @returns {[VendorClients, EnterpriseTokenGenerator]} The vendor's clients and the token generator behind them.
 */
export const getClients = lazy(function () {
    const vendorTokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(VENDOR_SCOPES)
            .build(),
    );

    /** @type {VendorClients} */
    const clients = {
        vendor: {
            systemUserClient: new SystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
        },
    };

    /** @type {[VendorClients, EnterpriseTokenGenerator]} */
    const built = [clients, vendorTokenGenerator];

    return built;
});

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

/**
 * Creates and caches the client the stream test reads with.
 *
 * A wider token than the vendor one: the stream is not scoped to a vendor or a
 * system, it hands out every system user in the environment, and the admin scope is
 * what opens it. The narrower system user scopes are answered with 403. No
 * organisation is set for the same reason, there is no one vendor to act as.
 *
 * Cached at module scope, so a VU builds it once and keeps the token it fetched
 * rather than refetching on every iteration.
 *
 * @returns {[SystemUserClient, EnterpriseTokenGenerator]} The client, and the generator the pagination helper needs to follow the stream on.
 */
export const getStreamClients = lazy(function () {
    const streamTokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(CreateScopeString([AltinnScopes.AUTHENTICATION.SYSTEMUSER.ADMIN]))
            .build(),
    );

    /** @type {[SystemUserClient, EnterpriseTokenGenerator]} */
    const built = [new SystemUserClient(__ENV.BASE_URL, streamTokenGenerator), streamTokenGenerator];

    return built;
});

export { cleanupArranged } from "../change-request-system-user/commons.js";
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
export const getResourceFlowClients = lazy(function () {
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

    /** @type {ResourceFlowClients} */
    const resourceFlowClients = {
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

    return resourceFlowClients;
});

/**
 * Builds a delegable generic resource, owned by the service owner the resource
 * client authenticates as.
 *
 * @param {string} identifierPrefix - Prefix for the generated identifier, so
 * resources are traceable to the test that made them. Only a-z, 0-9, _ and -.
 * @returns {import("../../../../clients/resource-registry/types.js").ServiceResource} The resource payload.
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
