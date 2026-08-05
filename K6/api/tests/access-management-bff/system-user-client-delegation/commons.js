import { group } from "k6";
import http from "k6/http";

import { SystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { SystemUserAgentDelegationClient } from "../../../../clients/access-management-bff/system-user-agent-delegation/index.js";
import { SystemUserAgentRequestClient } from "../../../../clients/access-management-bff/system-user-agent-request/index.js";
import {
    CreateAgentRequestSystemUserBuilder,
    RegisterSystemRequestBuilder,
    RequestSystemUserClient,
    SystemRegisterClient,
} from "../../../../clients/authentication/v2/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { GetAgentSystemUsers } from "../../../building-blocks/access-management-bff/system-user/index.js";
import { ApproveAgentRequest } from "../../../building-blocks/access-management-bff/system-user-agent-request/index.js";
import { RequestSystemUserBuildingBlocks } from "../../../building-blocks/authentication/v2/request-system-user/index.js";
import { SystemRegisterBuildingBlocks } from "../../../building-blocks/authentication/v2/system-register/index.js";

/**
 * The vendor this test acts as. Owns the system it registers.
 */
const SYSTEM_OWNER = "713431400";

/**
 * Every system registered by this test allows the same redirect url.
 */
const REDIRECT_URL = "https://digdir.no";

/**
 * How many clients one iteration delegates.
 *
 * yt01 is the load environment and the point there is to push a facilitator's
 * whole client list through, so it runs uncapped. The at environments and tt02
 * are smoke tested, where a facilitator with tens of thousands of clients would
 * turn a smoke test into a load test, so they stop at 100.
 */
export const MAX_CLIENTS_TO_DELEGATE = __ENV.ENVIRONMENT === "yt01" ? null : 100;

/**
 * The access packages a facilitator's agent system user is asked for, by the role
 * the facilitator holds.
 *
 * Every package belonging to the role rather than one of them, since the point is
 * to delegate the clients a role actually covers. Asking for a package the role
 * does not have leaves the client list short, and the clients that do come back
 * carry only the packages the system user was granted.
 *
 * The names are the ones the browser test registered its system with, see
 * K6/browser/system-user/client-delegation.js.
 */
export const ACCESS_PACKAGES_BY_ORG_TYPE = {
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
 * Test data folder, one file per environment.
 *
 * K6/testdata/access-management/client-delegation/<env>.csv
 * header: orgNo,partyId,orgUuid,userId,userPartyUuid,ssn,orgType
 *
 * Pointed at this branch rather than main, since the csv files land with this
 * test. Switch refs/heads/add-agent-system-user-client-delegation-test to
 * refs/heads/main when it is merged.
 */
const TESTDATA_BASE_URL =
    "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/add-agent-system-user-client-delegation-test/K6/testdata/access-management/client-delegation";

/**
 * @type {object | undefined}
 */
let clients = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let approverTokenGenerator = undefined;

/**
 * The facilitators the test delegates on behalf of.
 *
 * Returned flat rather than segmented per VU, since an iteration draws one at
 * random rather than working through a slice of its own.
 *
 * @param {string} env - Environment, e.g. "at22".
 * @returns {object[]} Facilitator organizations with the user that approves for them.
 */
export function getFacilitators(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/${env}.csv`, {
        tags: { action: "fetch-test-data" },
    });

    if (res.status !== 200) {
        console.error(`getFacilitators - no test data for ${env} at ${TESTDATA_BASE_URL}/${env}.csv, got ${res.status}`);

        return [];
    }

    return parseCsvData(res.body);
}

/**
 * Creates and caches the clients this test uses.
 *
 * Built once per VU and reused across its iterations, since the token generators
 * cache per instance and rebuilding them refetches every token.
 *
 * The vendor registers the system and asks for the agent system user, so it holds
 * an enterprise token against the platform. Everything after that is what the
 * facilitator does in the portal, so it goes through the bff with a personal
 * token. That token depends on which facilitator is in play, so swap its options
 * with setTokenGeneratorOptions rather than building a new generator.
 *
 * @returns {[object, PersonalTokenGenerator]} Clients grouped by who they act as, and the approver token generator.
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
                    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ,
                ]))
                .withOrganizationNumber(SYSTEM_OWNER)
                .build(),
        );

        approverTokenGenerator = new PersonalTokenGenerator(
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
                agentRequestClient: new SystemUserAgentRequestClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
                systemUserClient: new SystemUserClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
                agentDelegationClient: new SystemUserAgentDelegationClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
            },
        };
    }

    return [clients, approverTokenGenerator];
}

/**
 * Token options for acting as a facilitator.
 *
 * @param {object} facilitator - The facilitator to act on behalf of.
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
 * Registers one system that covers every role in the test data.
 *
 * One system rather than one per facilitator: the system is the vendor's
 * integration, and which role a given agent system user ends up with is decided
 * by the access package on its request, not by the registration.
 *
 * @returns {object} Identifiers and the registration payload.
 */
function createSystemRegistration() {
    const systemName = `k6-client-delegation-${uuidv4()}`;
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
            en: "Auto generated by the agent system user client delegation test.",
            nb: "Autogenerert av testen for klientdelegering til agent-systembruker.",
            nn: "Autogenerert av testen for klientdelegering til agent-systembrukar.",
        })
        .withAccessPackages(Object.values(ACCESS_PACKAGES_BY_ORG_TYPE).flat())
        .withClientId([clientId])
        .withVisibility(false)
        .withAllowedRedirectUrls([REDIRECT_URL])
        .build();

    return { systemId, clientId, registerSystemRequest };
}

/**
 * Gives every facilitator an approved agent system user.
 *
 * This is the arrange, and it runs in setup so the iterations measure the
 * delegation and nothing else. A facilitator that cannot be arranged is dropped
 * with a reason rather than failing the run, since the test data is drawn from
 * live environments where a given organization may have lost its role.
 *
 * @param {object[]} facilitators - Facilitator organizations from the test data.
 * @returns {object[]} The facilitators that got an agent system user, with its uuid.
 */
export function arrangeAgentSystemUsers(facilitators) {
    const [apiClients, tokenGenerator] = getClients();

    const registration = createSystemRegistration();
    const arranged = [];

    group("Arrange - every facilitator has an approved agent system user", function () {
        SystemRegisterBuildingBlocks.VendorCreate(apiClients.vendor.systemRegisterClient, registration.registerSystemRequest);

        for (const facilitator of facilitators) {
            const accessPackages = ACCESS_PACKAGES_BY_ORG_TYPE[facilitator.orgType];

            if (accessPackages === undefined) {
                console.error(`arrangeAgentSystemUsers - skipping ${facilitator.orgNo}, unknown orgType '${facilitator.orgType}'`);
                continue;
            }

            const externalRef = uuidv4();

            const agentRequest = new CreateAgentRequestSystemUserBuilder()
                .withExternalRef(externalRef)
                .withSystemId(registration.systemId)
                .withPartyOrgNo(facilitator.orgNo)
                .withAccessPackages(accessPackages.map((urn) => ({ urn })))
                .withRedirectUrl(REDIRECT_URL)
                .build();

            const created = RequestSystemUserBuildingBlocks.VendorAgentCreate(apiClients.vendor.requestSystemUserClient, agentRequest);

            if (!created?.id) {
                console.error(`arrangeAgentSystemUsers - skipping ${facilitator.orgNo}, the agent request was not created`);
                continue;
            }

            // From here the facilitator is the one acting, so the token has to be
            // theirs before the approval goes out.
            tokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(facilitator));

            if (!ApproveAgentRequest(apiClients.facilitator.agentRequestClient, facilitator.partyId, created.id)) {
                console.error(`arrangeAgentSystemUsers - skipping ${facilitator.orgNo}, the agent request was not approved`);
                continue;
            }

            // The system id is nested under system, not on the system user itself.
            const systemUsers = GetAgentSystemUsers(apiClients.facilitator.systemUserClient, facilitator.partyId) ?? [];
            const systemUser = systemUsers.find((candidate) => candidate.system?.systemId === registration.systemId);

            if (systemUser === undefined) {
                console.error(`arrangeAgentSystemUsers - skipping ${facilitator.orgNo}, no agent system user for system ${registration.systemId}`);
                console.error(`arrangeAgentSystemUsers - agent system users returned: ${JSON.stringify(systemUsers)}`);
                continue;
            }

            arranged.push({
                facilitator,
                systemUserGuid: systemUser.id,
                accessPackages,
            });
        }
    });

    console.log(`arrangeAgentSystemUsers - arranged ${arranged.length} of ${facilitators.length} facilitators`);

    return arranged;
}
