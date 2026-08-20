import { RegisterSystemRequestBuilder, SystemRegisterClient, SystemUserClient } from "../../../../clients/authentication/index.js";
import {
    ResourceClient,
    ResourcePartyType,
    ResourceType,
    ServiceResourceBuilder,
} from "../../../../clients/resource-registry/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";

/**
 * The service owner that owns the resources these tests create. The registry
 * compares the owner organization number against the consumer claim in the
 * token, so the two have to be the same. yt01 runs on a different org.
 */
const RESOURCE_OWNER_ORG = "ttd";
const RESOURCE_OWNER_ORG_NO = __ENV.ENVIRONMENT === "yt01" ? "713431400" : "991825827";

/**
 * The vendor these tests act as. Owns the systems they register.
 */
export const SYSTEM_OWNER = "312605031";

/**
 * An existing system of the vendor above, with enough system users on it to page
 * through. Read only, so the tests that use it create nothing.
 */
export const PAGINATION_SYSTEM_ID = "312605031_Virksomhetsbruker";

/**
 * Every system registered by these tests allows the same redirect url.
 */
const REDIRECT_URL = "https://altinn.no";

/**
 * @type {object | undefined}
 */
let clients = undefined;

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
 * Creates and caches the clients this test folder uses.
 *
 * Built once per VU and reused across its iterations. The token generators cache
 * tokens per instance, so building them per iteration refetches every token from
 * the token generator service each time.
 *
 * Three different callers show up here, and they cannot share a token: the
 * registry only lets the resource owner write, the vendor endpoints sit behind
 * the system register scope on the vendor org, and reading the rights the way a
 * consumer sees them wants the portal enduser scope.
 *
 * The vendor token generator itself is handed out alongside its clients, since
 * following next links means signing requests the clients do not make.
 *
 * @returns {object} Clients grouped by who they act as.
 */
export function getClients() {
    if (clients === undefined) {
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
                .withOrganizationNumber(SYSTEM_OWNER)
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

        clients = {
            resourceOwner: {
                resourceClient: new ResourceClient(__ENV.BASE_URL, resourceOwnerTokenGenerator),
            },
            vendor: {
                systemRegisterClient: new SystemRegisterClient(__ENV.BASE_URL, vendorTokenGenerator),
                systemUserClient: new SystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
                tokenGenerator: vendorTokenGenerator,
            },
            enduser: {
                systemRegisterClient: new SystemRegisterClient(__ENV.BASE_URL, enduserTokenGenerator),
            },
        };
    }

    return clients;
}

/**
 * Builds a right on a resource, the shape a system is registered with.
 *
 * @param {string} resource - The resource identifier.
 * @param {string} action - The action asked for on the resource. It has to be one
 * the resource policy grants, since a right is a resource and action pair.
 * @returns {object} The right.
 */
export function resourceRight(resource, action) {
    return {
        action,
        resource: [
            {
                id: "urn:altinn:resource",
                value: resource,
            },
        ],
    };
}

/**
 * Builds a delegable generic resource for one iteration, owned by the service
 * owner the resource client authenticates as.
 *
 * Unique per iteration, so unlike the clients it cannot be shared.
 *
 * @param {string} identifierPrefix - Prefix for the generated identifier, so
 * resources are traceable to the test that made them. Only a-z, 0-9, _ and -.
 * @returns {ServiceResource} The resource payload.
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

/**
 * Builds the identifiers and registration payload for one iteration.
 *
 * @param {object} options - Test specific parts of the registration.
 * @param {string} options.systemNamePrefix - Prefix for the generated system name, so systems are traceable to the test that made them.
 * @param {Array<object>} options.registeredRights - Every right the system is registered with.
 * @returns {object} Identifiers and the registration payload.
 */
export function createSystemRegistration({ systemNamePrefix, registeredRights }) {
    const systemName = `${systemNamePrefix}${uuidv4()}`;
    const systemId = `${SYSTEM_OWNER}_${systemName}`;
    const clientId = uuidv4();

    const registerSystemRequest = new RegisterSystemRequestBuilder()
        .withId(systemId)
        .withVendor(`0192:${SYSTEM_OWNER}`)
        .withName({
            en: systemName,
            nb: systemName,
            nn: systemName,
        })
        .withDescription({
            en: "This is auto generated by an integration test. Some data is randomized, but some is not - like this description",
            nb: "Integrasjonstest. Noe er randomisert her, men mye blir likt.",
            nn: "integrasjonstest på nynorsk. Noe er randomisert her, men mye blir likt.",
        })
        .withRights(registeredRights)
        .withClientId([clientId])
        .withVisibility(false)
        .withAllowedRedirectUrls([REDIRECT_URL])
        .build();

    return {
        systemOwner: SYSTEM_OWNER,
        systemId,
        systemName,
        clientId,
        registerSystemRequest,
    };
}
