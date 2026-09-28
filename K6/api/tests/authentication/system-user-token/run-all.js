import { setup, teardown } from "./commons.js";
import runExchangeSystemUserToken from "./exchange-system-user-token.js";
import runGetAuthorizedPartiesWithSystemUserToken from "./get-authorized-parties-with-system-user-token.js";
import runGetSystemUserToken from "./get-system-user-token.js";

export { setup, teardown };

/**
 * Runs every test in the folder against the one system user setup arranged.
 *
 * Each signs a Maskinporten grant, which is asynchronous, so this is awaited.
 *
 * @param {ReturnType<typeof setup>} data The arranged system users from setup.
 */
export default async function (data) {
    await runGetSystemUserToken(data);
    await runExchangeSystemUserToken(data);
    await runGetAuthorizedPartiesWithSystemUserToken(data);
}
