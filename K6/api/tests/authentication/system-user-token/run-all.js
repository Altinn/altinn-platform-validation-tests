import { setup, teardown } from "./commons.js";
import runExchangeSystemUserToken from "./exchange-system-user-token.js";
import runGetSystemUserToken from "./get-system-user-token.js";

export { setup, teardown };

/**
 * Runs both tests in the folder against the one system user setup arranged.
 *
 * Both sign a Maskinporten grant, which is asynchronous, so this is awaited.
 *
 * @param {any[]} data The arranged system users from setup.
 */
export default async function (data) {
    await runGetSystemUserToken(data);
    await runExchangeSystemUserToken(data);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
