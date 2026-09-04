import { fail, group } from "k6";

import { DeleteAgentSystemUserQueryBuilder, SystemUserClient as BffSystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { SystemUserAgentRequestClient } from "../../../../clients/access-management-bff/system-user-agent-request/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, lazy, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { CreateAgentRequestSystemUserBuilder, RegisterSystemRequestBuilder, RequestSystemUserBuildingBlocks, RequestSystemUserClient, SystemRegisterBuildingBlocks, SystemRegisterClient, SystemUserClientDelegationClient, SystemUserClientDelegationDomainChecks } from "../../../authentication-imports.js";
import { DeleteAgentSystemUser, GetAgentSystemUsers } from "../../../building-blocks/access-management-bff/system-user/index.js";
import { ApproveAgentRequest } from "../../../building-blocks/access-management-bff/system-user-agent-request/index.js";
import { pickVendor } from "../change-request-system-user/commons.js";
import { sweepRegisteredSystems } from "../commons.js";

/**
 * Whether to draw a random facilitator rather than walk the list.
 */
const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The scopes a vendor acts with.
 */
const VENDOR_SCOPES = CreateScopeString([
    AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE,
    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.WRITE,

    // Listing the requests on a system is how the teardown finds the ones a failed
    // run left pending.
    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ,
]);

/**
 * The scopes a facilitator acts with.
 *
 * The delegation endpoints sit behind the client delegation scopes, so the portal
 * scope the facilitator needs for the bff is not enough on its own: without these
 * the delegation calls answer 403 with an empty body.
 */
const FACILITATOR_SCOPES = CreateScopeString([
    AltinnScopes.PORTAL.ENDUSER,
    AltinnScopes.CLIENTDELEGATIONS.READ,
    AltinnScopes.CLIENTDELEGATIONS.WRITE,
]);

/**
 * Every system registered by these tests allows the same redirect url.
 */
const REDIRECT_URL = "https://digdir.no";

/**
 * The access packages an agent system user is asked for, by the role the
 * facilitator holds.
 *
 * Every package belonging to the role rather than one of them, since the clients
 * a facilitator gets back are the ones its packages cover. Asking for a package
 * the role does not have leaves the client list empty and the test with nothing
 * to delegate.
 *
 * The urns come from the access package catalogue, so a role that gains a package
 * needs it added here for the clients it covers to show up.
 *
 * The package also decides which of the facilitator's clients are delegable, not
 * only whether it has any: forretningsforer-eiendom only covers clients whose
 * organisation form is one of the property forms, so a property manager whose
 * clients are all AS gets an empty list from clients/available. That is a property
 * of the test data rather than of the test, which is why the facilitator csv only
 * holds property managers that have property clients.
 */
/** @type {{[orgType: string]: string[]}} */
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
 * @typedef {import("../commons.js").OrganizationUser} Facilitator
 */

/**
 * The agent system user the arrange step created, and what a test needs to work on it.
 *
 * @typedef {object} ArrangedAgentSystemUser
 * @property {Facilitator} facilitator The facilitator that holds the agent system user and the clients it can be given.
 * @property {string} vendorOrgNo The vendor that registered the system.
 * @property {string} systemId The system the agent system user was created on.
 * @property {string} systemUserId Identifier of the approved agent system user.
 * @property {string[]} accessPackages Urns of the access packages the agent system user was asked for, which decide which of the facilitator's clients are delegable.
 * @property {string} systemNamePrefix What the system was named with, which is what the teardown sweeps on.
 */

/**
 * The clients these tests act with.
 *
 * @typedef {object} ClientDelegationClients
 * @property {{systemRegisterClient: SystemRegisterClient, requestSystemUserClient: RequestSystemUserClient}} vendor The vendor that registers the system and asks for the agent system user.
 * @property {{clientDelegationClient: SystemUserClientDelegationClient, bffAgentRequestClient: SystemUserAgentRequestClient, bffSystemUserClient: BffSystemUserClient}} facilitator The facilitator that approves the agent system user and delegates its clients to it.
 */

/**
 * Creates and caches the clients these tests use.
 *
 * Built once per VU and reused across its iterations. The token generators cache
 * tokens per instance, so building them per iteration refetches every token from
 * the token generator service again.
 *
 * The vendor registers the system and asks for the agent system user, so it holds
 * an enterprise token. Everything after that is the facilitator's own doing, so it
 * goes with a personal token. Neither token is built for anyone in particular:
 * which vendor and which facilitator a run acts as is decided by swapping the
 * options with setTokenGeneratorOptions, the vendor with getVendorTokenOpts and
 * the facilitator with getFacilitatorTokenOpts. The cache is keyed on the options,
 * so each of them still gets its own cached token.
 *
 * @returns {{clients: ClientDelegationClients, facilitatorTokenGenerator: PersonalTokenGenerator, vendorTokenGenerator: EnterpriseTokenGenerator}} Clients grouped by who they act as, and the two token generators.
 */
export const getClients = lazy(function () {
    const vendorTokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(VENDOR_SCOPES)
            .build(),
    );

    const facilitatorTokenGenerator = new PersonalTokenGenerator(
        new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(FACILITATOR_SCOPES)
            .build(),
    );

    /** @type {ClientDelegationClients} */
    const clients = {
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

    return { clients, facilitatorTokenGenerator, vendorTokenGenerator };
});

/**
 * Token options for acting as a vendor.
 *
 * The scopes have to be repeated here, since the options replace the ones the
 * generator was built with rather than adding to them.
 *
 * @param {string} vendorOrgNo - Organisation number of the vendor this run acts as.
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
 * Token options for acting as a facilitator.
 *
 * The scopes have to be repeated here, since the options replace the ones the
 * generator was built with rather than adding to them.
 *
 * @param {Facilitator} facilitator - The facilitator this run acts on behalf of.
 * @returns Options to hand to setTokenGeneratorOptions.
 */
export function getFacilitatorTokenOpts(facilitator) {
    return new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(FACILITATOR_SCOPES)
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
 * An arrange that breaks ends the whole run at the step that broke: the test has
 * nothing to say without an agent system user, and letting it run on only buys a
 * second failure on the same cause. Stopping in setup means k6 skips the teardown,
 * so each step takes what the previous ones made with it before it stops.
 *
 * @param {string} systemNamePrefix - What the run names the system it registers, which is also what the teardown sweeps up. Unique per test file, see the note on it in the caller.
 * @param {string|null} [orgType] - Draw only facilitators of this type, e.g. "revisor". Leave it out to draw from all of them, which is what a test that does not care which access packages it gets wants.
 * @returns {ArrangedAgentSystemUser[]} A single arranged facilitator, as a list so a test picks from it with getItemFromList like any other test data.
 */
export function arrangeAgentSystemUser(systemNamePrefix, orgType = null) {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    /** @type {Facilitator[]} */
    const candidates = fetchTestData(`authentication/system-user-client-delegation/${__ENV.ENVIRONMENT}.csv`)
        .filter((/** @type {Facilitator} */ row) => orgType === null || row.orgType === orgType);

    if (candidates.length === 0) {
        fail(`cannot arrange an agent system user: no facilitator of type '${orgType}' in ${__ENV.ENVIRONMENT}`);
    }

    const facilitator = getItemFromList(candidates, randomize);

    const accessPackages = ACCESS_PACKAGES_BY_ORG_TYPE[facilitator.orgType];

    // Nothing has been created at this point, so this one can fail outright.
    if (accessPackages === undefined) {
        fail(`cannot arrange an agent system user: facilitator ${facilitator.orgNo} has unknown orgType '${facilitator.orgType}'`);
    }

    // Drawn rather than hardcoded, so a run says something about more than one
    // vendor over time. The vendor is only ever the organisation the enterprise
    // token is minted for, so nothing is looked up for it.
    const vendorOrgNo = pickVendor();

    const { clients: apiClients, facilitatorTokenGenerator, vendorTokenGenerator } = getClients();

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(vendorOrgNo));

    const registration = createSystemRegistration(vendorOrgNo, accessPackages, systemNamePrefix);

    const systemUserId = group("Arrange - the facilitator has an approved agent system user", function () {
        const createdSystemId = SystemRegisterBuildingBlocks.VendorCreate(apiClients.vendor.systemRegisterClient, registration.registerSystemRequest);

        if (createdSystemId === null) {
            fail("cannot arrange an agent system user: registering the system did not return a system id");
        }

        const agentRequest = new CreateAgentRequestSystemUserBuilder()
            .withExternalRef(uuidv4())
            .withSystemId(registration.systemId)
            .withPartyOrgNo(facilitator.orgNo)
            // The agent request takes access package objects, while the system
            // registration below takes the bare urns.
            .withAccessPackages(accessPackages.map((urn) => ({ urn })))
            .withRedirectUrl(REDIRECT_URL)
            .build();

        const created = RequestSystemUserBuildingBlocks.VendorAgentCreate(apiClients.vendor.requestSystemUserClient, agentRequest);

        if (!created?.id) {
            unwindArrange(registration.systemId);

            fail("cannot arrange an agent system user: the agent system user request was not created");
        }

        // From here on the facilitator is the one acting, so the token has to be
        // theirs before the approval goes out.
        facilitatorTokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(facilitator));

        if (!ApproveAgentRequest(apiClients.facilitator.bffAgentRequestClient, Number(facilitator.partyId), created.id)) {
            unwindArrange(registration.systemId, created.id);

            fail("cannot arrange an agent system user: the facilitator did not approve the agent system user request");
        }

        // The system id is nested under system, not on the system user itself.
        const systemUsers = GetAgentSystemUsers(apiClients.facilitator.bffSystemUserClient, Number(facilitator.partyId)) ?? [];
        const systemUser = systemUsers.find(
            (/** @type {{id?: string, system?: {systemId?: string}}} */ candidate) =>
                candidate.system?.systemId === registration.systemId,
        );

        // The request was approved, so the agent system user exists and the sweep
        // cannot take the system it belongs to. Left for someone to look at rather
        // than unwound, since deleting a system the facilitator holds an agent
        // system user on is not this step's call to make.
        if (!SystemUserClientDelegationDomainChecks.CheckAgentSystemUserArranged(systemUser?.id)) {
            console.error(`arrangeAgentSystemUser - agent system users returned: ${JSON.stringify(systemUsers)}`);

            fail("cannot arrange an agent system user: the approved agent system user could not be looked up");
        }

        return systemUser?.id;
    });

    return [
        {
            facilitator,
            vendorOrgNo,
            systemId: registration.systemId,
            systemUserId,
            accessPackages,
            systemNamePrefix,
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
 * @param {ArrangedAgentSystemUser[]} arranged - What arrangeAgentSystemUser returned.
 */
export function cleanupArranged(arranged) {
    const { clients: apiClients, facilitatorTokenGenerator, vendorTokenGenerator } = getClients();

    group("Cleanup - the facilitator deletes the agent system user and the vendor its system", function () {
        for (const arrangement of arranged ?? []) {
            facilitatorTokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(arrangement.facilitator));
            vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(arrangement.vendorOrgNo));

            DeleteAgentSystemUser(
                apiClients.facilitator.bffSystemUserClient,
                Number(arrangement.facilitator.partyId),
                arrangement.systemUserId,
                new DeleteAgentSystemUserQueryBuilder().withPartyUuid(arrangement.facilitator.orgUuid).build(),
            );

            SystemRegisterBuildingBlocks.VendorDelete(apiClients.vendor.systemRegisterClient, arrangement.systemId);

            // The delete above takes the system this run arranged. The sweep takes
            // whatever an earlier run left in this vendor's register, which is what
            // happens when the arrange itself broke: k6 skips the teardown when the
            // setup gives up.
            sweepRegisteredSystems(apiClients.vendor.systemRegisterClient, arrangement.vendorOrgNo, arrangement.systemNamePrefix, apiClients.vendor.requestSystemUserClient);
        }
    });
}

/**
 * Removes what the arrange had made when a later step of it stops the run.
 *
 * The arrange runs in setup, and k6 skips the teardown when the setup gives up, so
 * a step that stops has to take the system and the request with it. The request
 * goes first, since a pending one outlives the system it was made for.
 *
 * @param {string} systemId - The system the arrange registered.
 * @param {string} [requestId] - The agent system user request to withdraw, when the arrange got as far as creating one.
 */
function unwindArrange(systemId, requestId = undefined) {
    const { clients: apiClients } = getClients();

    if (requestId !== undefined) {
        RequestSystemUserBuildingBlocks.VendorDelete(apiClients.vendor.requestSystemUserClient, requestId);
    }

    SystemRegisterBuildingBlocks.VendorDelete(apiClients.vendor.systemRegisterClient, systemId);
}

/**
 * Builds the registration payload for the system the agent system user is made for.
 *
 * @param {string} vendorOrgNo - Organisation number of the vendor the system is registered as.
 * @param {string[]} accessPackages - Urns of the access packages the system is registered with.
 * @param {string} systemNamePrefix - What the system is named with, which is what the teardown sweeps on.
 * @returns The system id and the registration payload.
 */
function createSystemRegistration(vendorOrgNo, accessPackages, systemNamePrefix) {
    const systemName = `${systemNamePrefix}${uuidv4()}`;
    const systemId = `${vendorOrgNo}_${systemName}`;

    const registerSystemRequest = new RegisterSystemRequestBuilder()
        .withId(systemId)
        .withVendor(`0192:${vendorOrgNo}`)
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
