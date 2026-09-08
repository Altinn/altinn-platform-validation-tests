import { group } from "k6";

import { ChangeRequestSystemUserClient, RequestSystemUserClient, SystemRegisterClient } from "../../../clients/authentication/index.js";
import { ChangeRequestSystemUserBuildingBlocks, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks } from "../../authentication-imports.js";

/**
 * A row of `change-request-system-user/end-users-<env>.csv`.
 *
 * The customers the system user tests act on behalf of: someone who can approve for
 * a company without anyone having delegated to them first, so daglig leder in an AS
 * and innehaver in an ENK. Built per environment by `yarn tenor:endusers` in
 * altinn-access-management-frontend, since Tenor holds the same synthetic companies
 * everywhere while the Altinn ids differ per environment.
 *
 * Every column comes off the csv as a string, the ids included.
 *
 * @typedef {object} EndUser
 * @property {string} orgNo Organisation number of the company.
 * @property {string} orgPartyId Party id of the company, which the bff endpoints take.
 * @property {string} orgPartyUuid Party uuid of the company.
 * @property {string} orgType Organisation form, `AS` or `ENK`.
 * @property {string} role The role the user holds in the company, `dagligleder` or `innehaver`.
 * @property {string} userId User id, for the personal token.
 * @property {string} userPartyUuid Party uuid of the user, for the personal token.
 * @property {string} userPid National identity number of the user.
 */

/**
 * A row of `system-user-request/<env>.csv` and of
 * `system-user-client-delegation/<env>.csv`, which have the same columns.
 *
 * An organisation paired with a user who can act for it: the customer a system user
 * request is made for in the one file, and the accountant, auditor or property
 * manager whose clients are delegated in the other. Both are built per environment
 * in altinn-access-management-frontend, the facilitators by `yarn
 * tenor:klientdelegering`.
 *
 * Every column comes off the csv as a string, the ids included.
 *
 * @typedef {object} OrganizationUser
 * @property {string} orgNo Organisation number.
 * @property {string} partyId Party id of the organisation, which the bff endpoints take.
 * @property {string} orgUuid Party uuid of the organisation.
 * @property {string} userId User id, for the personal token.
 * @property {string} userPartyUuid Party uuid of the user, for the personal token.
 * @property {string} ssn National identity number of the user.
 * @property {string} orgType What the organisation is to its clients, `revisor`, `regnskapsforer` or `forretningsforer`, and the organisation form for the request customers.
 */

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
 * @param {RequestSystemUserClient|null} [requestSystemUserClient] - Client for the requests, for a test that makes them. Pass it and the pending requests on a leftover system go too.
 * @param {ChangeRequestSystemUserClient|null} [changeRequestSystemUserClient] - Client for the change requests, for a test that makes them. Pass it and the pending change requests go too.
 * @returns {number} How many systems were swept up.
 */
export function sweepRegisteredSystems(systemRegisterClient, vendorOrgNo, systemNamePrefix, requestSystemUserClient = null, changeRequestSystemUserClient = null) {
    let swept = 0;

    group(`Teardown - remove the systems left in the register by ${systemNamePrefix}`, function () {
        const prefix = `${vendorOrgNo}_${systemNamePrefix}`;

        const leftovers = (SystemRegisterBuildingBlocks.VendorGet(systemRegisterClient) ?? [])
            .filter((system) => `${system?.systemId}`.startsWith(prefix));

        for (const system of leftovers) {
            if (system.systemId === null || system.systemId === undefined) {
                continue;
            }

            if (requestSystemUserClient !== null) {
                sweepPendingRequests(requestSystemUserClient, system.systemId);
            }

            if (changeRequestSystemUserClient !== null) {
                sweepPendingChangeRequests(changeRequestSystemUserClient, system.systemId);
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
 * Withdraws the change requests still pending on a system.
 *
 * Same job as sweepPendingRequests, for the other kind. A change request that
 * nobody acted on stays listed for the system even after the system user it was
 * made for and the system itself are deleted, so a run that stopped between
 * creating one and withdrawing it leaves it behind for good. Nothing else in the
 * repo picks those up.
 *
 * Only the ones still waiting: an accepted change request has been applied to the
 * system user, and asking to withdraw it only answers an error.
 *
 * Only the first page: a system these tests make carries a handful of change
 * requests per run, so a second page means something other than leftovers.
 *
 * @param {ChangeRequestSystemUserClient} changeRequestSystemUserClient - Client authenticated as the vendor that made the change requests.
 * @param {string} systemId - The system whose change requests are withdrawn.
 * @returns {number} How many change requests were withdrawn.
 */
export function sweepPendingChangeRequests(changeRequestSystemUserClient, systemId) {
    const pending = (ChangeRequestSystemUserBuildingBlocks.VendorGetBySystem(changeRequestSystemUserClient, systemId)?.data ?? [])
        .filter((changeRequest) => changeRequest?.status === "New");

    for (const changeRequest of pending) {
        ChangeRequestSystemUserBuildingBlocks.VendorDelete(changeRequestSystemUserClient, changeRequest.id);
    }

    if (pending.length > 0) {
        console.info(`sweepPendingChangeRequests - withdrew ${pending.length} pending change request(s) on ${systemId}`);
    }

    return pending.length;
}
