import { fail, group } from "k6";

import { DeleteAgentSystemUserQueryBuilder, SystemUserClient as BffSystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { SystemUserAgentRequestClient } from "../../../../clients/access-management-bff/system-user-agent-request/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { CreateAgentRequestSystemUserBuilder, RegisterSystemRequestBuilder, RequestSystemUserBuildingBlocks, RequestSystemUserClient, SystemRegisterBuildingBlocks, SystemRegisterClient, SystemUserClientDelegationClient } from "../../../authentication-imports.js";
import { DeleteAgentSystemUser, GetAgentSystemUsers } from "../../../building-blocks/access-management-bff/system-user/index.js";
import { ApproveAgentRequest } from "../../../building-blocks/access-management-bff/system-user-agent-request/index.js";

/**
 * Whether to draw a random facilitator rather than walk the list.
 */
const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The vendor these tests act as. Owns the system they register.
 */
const SYSTEM_OWNER = "713431400";

/**
 * Every system registered by these tests allows the same redirect url.
 */
const REDIRECT_URL = "https://digdir.no";

/**
 * The branch the facilitator test data is read from.
 *
 * The csv files land with these tests, so main does not have them yet. Drop this
 * and let fetchTestData default to main once this branch is merged.
 */
const TESTDATA_BRANCH = "authentication-endpoint-coverage";

/**
 * The access packages an agent system user is asked for, by the role the
 * facilitator holds.
 *
 * Every package belonging to the role rather than one of them, since the clients
 * a facilitator gets back are the ones its packages cover. Asking for a package
 * the role does not have leaves the client list empty and the test with nothing
 * to delegate.
 *
 * The names are the ones the browser test registers its system with, see
 * K6/browser/system-user/client-delegation.js.
 */
const ACCESS_PACKAGES_BY_ORG_TYPE = {
    regnskapsforer: [
        "urn:altinn:accesspackage:regnskapsforer-med-signeringsrettighet",
        "urn:altinn:accesspackage:regnskapsforer-uten-signeringsrettighet",
        "urn:altinn:accesspackage:regnskapsforer-lonn",
    ],
    revisor: [
        "urn:altinn:accesspackage:ansvarlig-revisor",
        "urn:altinn:accesspackage:revisormedarbeider",
    ],
    forretningsforer: [
        "urn:altinn:accesspackage:forretningsforer-eiendom",
    ],
};

/**
 * @type {object | undefined}
 */
let clients = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let facilitatorTokenGenerator = undefined;

/**
 * Creates and caches the clients these tests use.
 *
 * Built once per VU and reused across its iterations. The token generators cache
 * tokens per instance, so building them per iteration refetches every token from
 * the token generator service again.
 *
 * The vendor registers the system and asks for the agent system user, so it holds
 * an enterprise token. Everything after that is the facilitator's own doing, so it
 * goes with a personal token. Which facilitator that is changes per run, so swap
 * the options with setTokenGeneratorOptions and getFacilitatorTokenOpts rather
 * than building a new generator.
 *
 * @returns {[object, PersonalTokenGenerator]} Clients grouped by who they act as, and the facilitator token generator.
 */
export function getClients() {
    if (clients === undefined) {
        const vendorTokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(CreateScopeString([
                    AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE,
                    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.WRITE,
                ]))
                .withOrganizationNumber(SYSTEM_OWNER)
                .build(),
        );

        facilitatorTokenGenerator = new PersonalTokenGenerator(
            new PersonalTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
                .build(),
        );

        clients = {
            vendor: {
                systemRegisterClient: new SystemRegisterClient(__ENV.BASE_URL, vendorTokenGenerator),
                requestSystemUserClient: new RequestSystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
            },
            facilitator: {
                // The delegation endpoints under test live in authentication, while
                // approving the agent request and deleting the system user is what
                // the facilitator does in the portal, so those go through the bff.
                clientDelegationClient: new SystemUserClientDelegationClient(__ENV.BASE_URL, facilitatorTokenGenerator),
                bffAgentRequestClient: new SystemUserAgentRequestClient(__ENV.AM_UI_BASE_URL, facilitatorTokenGenerator),
                bffSystemUserClient: new BffSystemUserClient(__ENV.AM_UI_BASE_URL, facilitatorTokenGenerator),
            },
        };
    }

    return [clients, facilitatorTokenGenerator];
}

/**
 * Token options for acting as a facilitator.
 *
 * @param {object} facilitator - The facilitator this run acts on behalf of.
 * @returns {object} Options to hand to setTokenGeneratorOptions.
 */
export function getFacilitatorTokenOpts(facilitator) {
    return new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
        .withUserId(facilitator.userId)
        .withPartyUuid(facilitator.userPartyUuid)
        .build();
}

/**
 * Draws a facilitator and gives it an approved agent system user.
 *
 * Call from a test's setup, so the iterations measure the delegation endpoints and
 * not the arrange. The facilitators are accountants, auditors and property
 * managers with clients in the environment, built by `yarn tenor:klientdelegering`
 * in altinn-access-management-frontend. One is drawn per run rather than the whole
 * list being arranged, so a run stays short and successive runs spread over the
 * organisations rather than hammering one.
 *
 * @returns {object[]} A single arranged facilitator, as a list so a test picks from it with getItemFromList like any other test data.
 */
export function arrangeAgentSystemUser() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    const facilitator = getItemFromList(
        fetchTestData(`authentication/system-user-client-delegation/${__ENV.ENVIRONMENT}.csv`, true, TESTDATA_BRANCH),
        randomize,
    );

    const accessPackages = ACCESS_PACKAGES_BY_ORG_TYPE[facilitator.orgType];

    if (accessPackages === undefined) {
        fail(`cannot arrange an agent system user: facilitator ${facilitator.orgNo} has unknown orgType '${facilitator.orgType}'`);
    }

    const [apiClients, tokenGenerator] = getClients();
    const registration = createSystemRegistration(accessPackages);

    let systemUserId;

    group("Arrange - the facilitator has an approved agent system user", function () {
        const createdSystemId = SystemRegisterBuildingBlocks.VendorCreate(apiClients.vendor.systemRegisterClient, registration.registerSystemRequest);

        if (createdSystemId === null) {
            fail("cannot arrange an agent system user: registering the system did not return a system id");
        }

        const agentRequest = new CreateAgentRequestSystemUserBuilder()
            .withExternalRef(uuidv4())
            .withSystemId(registration.systemId)
            .withPartyOrgNo(facilitator.orgNo)
            .withAccessPackages(accessPackages.map((urn) => ({ urn })))
            .withRedirectUrl(REDIRECT_URL)
            .build();

        const created = RequestSystemUserBuildingBlocks.VendorAgentCreate(apiClients.vendor.requestSystemUserClient, agentRequest);

        if (!created?.id) {
            fail("cannot arrange an agent system user: the agent request was not created");
        }

        // From here on the facilitator is the one acting, so the token has to be
        // theirs before the approval goes out.
        tokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(facilitator));

        if (!ApproveAgentRequest(apiClients.facilitator.bffAgentRequestClient, facilitator.partyId, created.id)) {
            fail("cannot arrange an agent system user: the agent request was not approved");
        }

        // The system id is nested under system, not on the system user itself.
        const systemUsers = GetAgentSystemUsers(apiClients.facilitator.bffSystemUserClient, facilitator.partyId) ?? [];
        const systemUser = systemUsers.find((candidate) => candidate.system?.systemId === registration.systemId);

        if (systemUser === undefined) {
            console.error(`arrangeAgentSystemUser - agent system users returned: ${JSON.stringify(systemUsers)}`);
            fail(`cannot arrange an agent system user: the facilitator has none for system ${registration.systemId}`);
        }

        systemUserId = systemUser.id;
    });

    return [
        {
            facilitator,
            systemId: registration.systemId,
            systemUserId,
            accessPackages,
        },
    ];
}

/**
 * Removes what a test arranged.
 *
 * Call from a test's teardown with what its setup returned, so a run does not
 * leave an agent system user on the facilitator and a system in the register for
 * every time it has run. Deleting the system user is the facilitator's own action,
 * so it goes through the bff, while the system belongs to the vendor. The system
 * goes last, since it is what the system user is built on.
 *
 * @param {object[]} arranged - What arrangeAgentSystemUser returned.
 */
export function cleanupArranged(arranged) {
    const [apiClients, tokenGenerator] = getClients();

    group("Cleanup - the facilitator deletes the agent system user and the vendor its system", function () {
        for (const systemUser of arranged ?? []) {
            tokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(systemUser.facilitator));

            DeleteAgentSystemUser(
                apiClients.facilitator.bffSystemUserClient,
                systemUser.facilitator.partyId,
                systemUser.systemUserId,
                new DeleteAgentSystemUserQueryBuilder().withPartyUuid(systemUser.facilitator.orgUuid).build(),
            );

            SystemRegisterBuildingBlocks.VendorDelete(apiClients.vendor.systemRegisterClient, systemUser.systemId);
        }
    });
}

/**
 * Builds the registration payload for the system the agent system user is made for.
 *
 * @param {string[]} accessPackages - Urns of the access packages the system is registered with.
 * @returns {object} The system id and the registration payload.
 */
function createSystemRegistration(accessPackages) {
    const systemName = `clientdelegation${uuidv4()}`;
    const systemId = `${SYSTEM_OWNER}_${systemName}`;

    const registerSystemRequest = new RegisterSystemRequestBuilder()
        .withId(systemId)
        .withVendor(`0192:${SYSTEM_OWNER}`)
        .withName({
            en: systemName,
            nb: systemName,
            nn: systemName,
        })
        .withDescription({
            en: "Auto generated by the client delegation test in altinn-platform-validation-tests.",
            nb: "Autogenerert av testen for klientdelegering i altinn-platform-validation-tests.",
            nn: "Autogenerert av testen for klientdelegering i altinn-platform-validation-tests.",
        })
        .withAccessPackages(accessPackages)
        .withClientId([uuidv4()])
        .withVisibility(false)
        .withAllowedRedirectUrls([REDIRECT_URL])
        .build();

    return { systemId, registerSystemRequest };
}
