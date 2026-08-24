import { MaskinportenAccessTokenGenerator, MaskinportenTokenBuilder } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
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
 * k6 setup stage. Fetches the Maskinporten token these tests act as the vendor with.
 *
 * Fetched here rather than where the clients are built, so that a run which cannot
 * sign the grant says so before any iteration starts, and so the tests below only
 * have to say what they do with the token.
 *
 * The token crosses into the iterations, not the generator: k6 serializes the setup
 * result to JSON and the prototypes would not survive. That also means it is not
 * renewed while the run lasts, so this holds for a run that fits inside the lifetime
 * Maskinporten gave it. A load run would need a generator per VU instead, and the
 * teardown signs a grant of its own rather than trusting this one to still be good.
 *
 * @returns {Promise<{vendorToken: string}>} The token the vendor acts with.
 */
export async function setup() {
    requireEnv(["BASE_URL"]);

    return { vendorToken: await fetchVendorToken() };
}

/**
 * Signs a grant and fetches a Maskinporten access token for the system register.
 *
 * Async, unlike everything else here: signing goes through SubtleCrypto, which is
 * promise based.
 *
 * @returns {Promise<string>} The access token.
 */
export async function fetchVendorToken() {
    const tokenGenerator = new MaskinportenAccessTokenGenerator(
        new MaskinportenTokenBuilder()
            .withScopes(CreateScopeString([AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE]))
            .build(),
    );

    return await tokenGenerator.ensureToken();
}

/**
 * Builds the client these tests register and delete systems with.
 *
 * Takes the token rather than fetching one, so what a test does with the register
 * and where the token comes from stay apart.
 *
 * @param {string} vendorToken - The token from setup.
 * @returns {SystemRegisterClient} The client, acting as the vendor.
 */
export function getVendorClient(vendorToken) {
    return new SystemRegisterClient(__ENV.BASE_URL, {
        // The clients ask a generator for a token per request. This one is already
        // fetched, so it only has to be handed over.
        getToken: () => vendorToken,
    });
}

/**
 * Removes the systems a test left in the register.
 *
 * Call from a test's teardown, with the prefix that test names its systems with.
 *
 * Signs its own grant rather than reusing the token from setup. The teardown is the
 * last thing a run does, and in the aggregate run it comes after every other folder,
 * so the setup token can have expired by then. That failure would be a quiet one:
 * the listing answers 401, the sweep reads the empty result as nothing to remove and
 * says nothing, and every system stays in the register.
 *
 * @param {string} systemNamePrefix - The prefix the test names its systems with.
 * @returns {Promise<void>} Resolves once the systems are gone.
 */
export async function sweepSystems(systemNamePrefix) {
    sweepRegisteredSystems(getVendorClient(await fetchVendorToken()), VENDOR_ID, systemNamePrefix);
}
