import { setup } from "./commons.js";
import runExchangeMaskinportenToken from "./exchange-maskinporten-token.js";

export { setup };

/**
 * Runs the folder's only test, so every folder has the same entry point. A second
 * test in here goes in the list below.
 *
 * @param {Awaited<ReturnType<typeof setup>>} data The Maskinporten token from setup.
 */
export default function (data) {
    runExchangeMaskinportenToken(data);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
