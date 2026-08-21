import { MaskinportenAccessTokenGenerator, MaskinportenTokenBuilder } from "../../../../common-imports.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { SystemRegisterClient } from "../../../authentication-imports.js";
import { sweepRegisteredSystems } from "../commons.js";

/**
 * The vendor these tests register their systems as.
 *
 * Not drawn from the vendor list the way the system user tests do it: these tests
 * sign their own Maskinporten grant, so the vendor is whichever client the
 * `313175650-maskinporten-client` secret belongs to.
 */
export const VENDOR_ID = "313175650";

/**
 * @type {SystemRegisterClient | undefined}
 */
let systemRegisterClient = undefined;

/**
 * Creates and caches the client these tests register and delete systems with.
 *
 * Async, unlike the other client helpers in this repo: signing the Maskinporten
 * grant goes through SubtleCrypto, so the token has to be fetched before a client
 * starts asking for it.
 *
 * @returns {Promise<SystemRegisterClient>} The client.
 */
export async function getVendorClient() {
    if (systemRegisterClient === undefined) {
        const tokenGenerator = new MaskinportenAccessTokenGenerator(
            new MaskinportenTokenBuilder()
                .withScopes(CreateScopeString([AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE]))
                .build(),
        );

        await tokenGenerator.ensureToken();

        systemRegisterClient = new SystemRegisterClient(__ENV.BASE_URL, tokenGenerator);
    }

    return systemRegisterClient;
}

/**
 * Removes the systems a test left in the register.
 *
 * Call from a test's teardown, with the prefix that test names its systems with.
 *
 * @param {string} systemNamePrefix - The prefix the test names its systems with.
 */
export async function sweepSystems(systemNamePrefix) {
    sweepRegisteredSystems(await getVendorClient(), VENDOR_ID, systemNamePrefix);
}
