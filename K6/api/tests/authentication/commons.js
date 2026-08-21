import { group } from "k6";

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
