import { group } from "k6";

import { SystemRegisterBuildingBlocks } from "../../authentication-imports.js";

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
 * @returns {number} How many systems were swept up.
 */
export function sweepRegisteredSystems(systemRegisterClient, vendorOrgNo, systemNamePrefix) {
    let swept = 0;

    group(`Teardown - remove the systems left in the register by ${systemNamePrefix}`, function () {
        const prefix = `${vendorOrgNo}_${systemNamePrefix}`;

        const leftovers = (SystemRegisterBuildingBlocks.VendorGet(systemRegisterClient) ?? [])
            .filter((system) => `${system?.systemId}`.startsWith(prefix));

        for (const system of leftovers) {
            SystemRegisterBuildingBlocks.VendorDelete(systemRegisterClient, system.systemId);
        }

        swept = leftovers.length;

        if (swept > 0) {
            console.info(`sweepRegisteredSystems - removed ${swept} system(s) matching ${prefix}`);
        }
    });

    return swept;
}
