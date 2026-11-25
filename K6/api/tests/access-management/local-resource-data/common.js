import { fail } from "k6";

import { ConnectionsClient as EnduserConnectionsClient } from "../../../../clients/access-management/enduser/connections/index.js";
import { RequestClient as EnduserRequestClient } from "../../../../clients/access-management/enduser/request/index.js";
import { RequestV2Client as EnduserRequestV2Client } from "../../../../clients/access-management/enduser/request-v2/index.js";
import { ConnectionsClient as ServiceOwnerConnectionsClient } from "../../../../clients/access-management/service-owner/connections/index.js";
import { RequestClient as ServiceOwnerRequestClient } from "../../../../clients/access-management/service-owner/request/index.js";
import {
    EnterpriseTokenBuilder,
    EnterpriseTokenGenerator,
    PersonalTokenBuilder,
    PersonalTokenGenerator,
} from "../../../../common-imports.js";
import { fetchTestData, lazy, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { OWNER } from "./resources.js";

/**
 * A daglig leder and the organization they lead.
 *
 * @typedef {object} DailyManagerRow
 * @property {string} pid The daglig leder's national identity number.
 * @property {string} partyUuid The daglig leder's party uuid.
 * @property {string} userId The daglig leder's Altinn user id.
 * @property {string} partyId The daglig leder's party id.
 * @property {string} orgUuid The organization's party uuid.
 * @property {string} orgNo The organization number.
 */

/**
 * Reads the daglig ledere the enduser calls act as.
 *
 * Borrowed from the enduser request test rather than copied, so this folder needs
 * no fixture of its own: those rows are daglig ledere with the user id and party
 * id the decision point needs to recognize a person acting for themselves, which
 * is what every enduser call here takes. Rows without them are left out, which
 * is why yt01 has nothing to run on.
 *
 * The first row's organization is never put on an access list for
 * k6-access-list-resource, so the scheduled access list tests can use it as an
 * outsider. access-list-membership.js puts the last row on one instead.
 *
 * @returns {{users: Array<DailyManagerRow>}} The test data.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    /** @type {Array<DailyManagerRow>} */
    const rows = fetchTestData(`access-management/enduser/request/${__ENV.ENVIRONMENT}.csv`);
    const users = rows.filter((row) => row.userId && row.partyId);

    if (users.length === 0) {
        fail(`No row with userId and partyId in access-management/enduser/request/${__ENV.ENVIRONMENT}.csv`);
    }

    return { users };
}

/**
 * Personal token options for a daglig leder.
 *
 * @param {DailyManagerRow} user The daglig leder.
 * @returns {*} Options to hand to setTokenGeneratorOptions.
 */
export function getEnduserTokenOpts(user) {
    return new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
        .withPid(user.pid)
        .withUserId(user.userId)
        .withPartyId(user.partyId)
        .withPartyUuid(user.partyUuid)
        .build();
}

/**
 * The enduser clients, with one token generator the tests point at a daglig
 * leder through getEnduserTokenOpts.
 *
 * @returns {{connections: EnduserConnectionsClient, request: EnduserRequestClient, requestV2: EnduserRequestV2Client, tokenGenerator: PersonalTokenGenerator}} The clients.
 */
export const getEnduserClients = lazy(function () {
    const tokenGenerator = new PersonalTokenGenerator();

    return {
        connections: new EnduserConnectionsClient(__ENV.BASE_URL, tokenGenerator),
        request: new EnduserRequestClient(__ENV.BASE_URL, tokenGenerator),
        requestV2: new EnduserRequestV2Client(__ENV.BASE_URL, tokenGenerator),
        tokenGenerator,
    };
});

/**
 * The service owner clients, acting as the resources' owner.
 *
 * The not-delegable refusal comes before the ownership check in both service
 * owner APIs, so the owner is not needed for the refusal itself. It is used
 * anyway, so that a refusal can only be about the flag: as anyone else, a 400
 * could also be the ownership check.
 *
 * @returns {{connections: ServiceOwnerConnectionsClient, request: ServiceOwnerRequestClient}} The clients.
 */
export const getServiceOwnerClients = lazy(function () {
    const tokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withOrganization(OWNER.orgcode)
            .withOrganizationNumber(OWNER.orgno)
            .withScopes(CreateScopeString([
                AltinnScopes.SERVICEOWNER.DELEGATIONS.RESOURCE.WRITE,
                AltinnScopes.SERVICEOWNER.DELEGATIONREQUESTS.WRITE,
            ]))
            .build(),
    );

    return {
        connections: new ServiceOwnerConnectionsClient(__ENV.BASE_URL, tokenGenerator),
        request: new ServiceOwnerRequestClient(__ENV.BASE_URL, tokenGenerator),
    };
});
