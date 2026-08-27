import { check } from "k6";

import { DiscoveryDocument, JwksDocument } from "../../../clients/authentication/types.js";

/**
 * Fields in the discovery document that name another endpoint, and that every
 * Altinn environment fills in today.
 *
 * The list is deliberately short. The OpenID Connect discovery spec allows a lot
 * more, and Altinn's document leaves most of it out (there is no
 * `introspection_endpoint` here even though the introspection endpoint exists, and
 * no `userinfo_endpoint`), so requiring the full set would only assert that Altinn
 * is a full OpenID provider, which it does not claim to be. What is checked is what
 * the document actually promises.
 *
 * @type {Array<keyof DiscoveryDocument>}
 */
const ENDPOINT_FIELDS = [
    "jwks_uri",
    "authorization_endpoint",
    "token_endpoint",
    "end_session_endpoint",
];

/**
 * Fields in the discovery document that list what the provider supports.
 *
 * Only the presence and the emptiness of each list is checked, never its contents.
 * Which algorithms and response types an environment offers is a deployment
 * decision that can legitimately differ, while an empty list means a relying party
 * has nothing to negotiate with and is a fault everywhere.
 *
 * @type {Array<keyof DiscoveryDocument>}
 */
const SUPPORT_FIELDS = [
    "response_types_supported",
    "subject_types_supported",
    "id_token_signing_alg_values_supported",
];

/**
 * Builds the prefix a URL has to start with to belong to the environment.
 *
 * The trailing slash is what makes this an origin test rather than a substring
 * test. Without it `https://platform.at22.altinn.no.example/` starts with the at22
 * base url and would pass, which is exactly the kind of host a misdirected document
 * would name.
 *
 * @param {string} baseUrl - Base URL of the environment under test.
 * @returns {string} The prefix, ending in a single slash.
 */
function originPrefix(baseUrl) {
    return `${baseUrl.replace(/\/+$/, "")}/`;
}

/**
 * Checks that the discovery document says who issues the tokens.
 *
 * The issuer is what a relying party compares the `iss` claim against, so it has to
 * be the environment being tested and not, say, the one the document was copied
 * from. Matching on the base URL rather than on a full string keeps the check
 * honest across environments while still catching a document served by the wrong
 * one.
 *
 * @param {DiscoveryDocument|null} discovery - The discovery document.
 * @param {string} baseUrl - Base URL of the environment under test.
 * @returns {boolean} True if the issuer names this environment, false otherwise.
 */
function CheckIssuerIsThisEnvironment(discovery, baseUrl) {
    const prefix = originPrefix(baseUrl);

    const success = check(discovery, {
        "CheckIssuerIsThisEnvironment - The issuer names the environment under test": (document) =>
            typeof document?.issuer === "string"
            && document.issuer.startsWith(prefix),
    });

    if (!success) {
        console.error(`CheckIssuerIsThisEnvironment - expected an issuer under ${prefix}, got: ${discovery?.issuer}`);
    }

    return success;
}

/**
 * Checks that every endpoint the document names is an absolute URL under this
 * environment.
 *
 * Two things at once, because for these fields they are the same requirement. A
 * relying party reads them and calls them without a base to resolve against, so a
 * relative or missing value makes the document unusable even though it parses. And
 * OpenID Connect Discovery has the metadata describe the issuer that serves it, so
 * none of these may point out of the environment.
 *
 * The origin check is what catches the case the test is really here for. A document
 * with the right issuer but a `jwks_uri` pointing at another environment reads as
 * well-formed the whole way through: the URL is https, it answers 200, and it holds
 * a perfectly good RSA key. It is just the wrong key, so every relying party in the
 * environment ends up unable to verify the tokens the environment issues. Following
 * the advertised URL does not catch that. Comparing it does.
 *
 * @param {DiscoveryDocument|null} discovery - The discovery document.
 * @param {string} baseUrl - Base URL of the environment under test.
 * @returns {boolean} True if all the expected endpoints are absolute URLs under this environment, false otherwise.
 */
function CheckEndpointsBelongToThisEnvironment(discovery, baseUrl) {
    const prefix = originPrefix(baseUrl);

    let success = true;

    for (const field of ENDPOINT_FIELDS) {
        const value = discovery?.[field];

        const present = check(discovery, {
            [`CheckEndpointsBelongToThisEnvironment - ${field} is an absolute URL under this environment`]: () =>
                typeof value === "string" && value.startsWith(prefix),
        });

        if (!present) {
            console.error(`CheckEndpointsBelongToThisEnvironment - expected ${field} under ${prefix}, got: ${JSON.stringify(value)}`);
            success = false;
        }
    }

    return success;
}

/**
 * Checks that the document says what the provider supports.
 *
 * Each of these is a list a relying party picks from, so an empty one leaves it
 * nothing to pick and is as bad as leaving the field out. The values inside are not
 * asserted on: see the note on SUPPORT_FIELDS.
 *
 * @param {DiscoveryDocument|null} discovery - The discovery document.
 * @returns {boolean} True if every supported-values list is present and non-empty, false otherwise.
 */
function CheckSupportedValuesAreListed(discovery) {
    let success = true;

    for (const field of SUPPORT_FIELDS) {
        const value = discovery?.[field];

        const listed = check(discovery, {
            [`CheckSupportedValuesAreListed - ${field} is a non-empty list`]: () =>
                Array.isArray(value) && value.length > 0,
        });

        if (!listed) {
            console.error(`CheckSupportedValuesAreListed - ${field} was: ${JSON.stringify(value)}`);
            success = false;
        }
    }

    return success;
}

/**
 * Checks that the key set holds a key a token signature can be verified with.
 *
 * What makes a key usable is the whole set of fields together: `kty` and the RSA
 * `n`/`e` pair are the key material, `kid` is how a token header points at this key
 * rather than another one during a rollover, and `use` says the key is for
 * signatures. A set that has a key missing any of them cannot be used, so the check
 * is on the combination and not on the count.
 *
 * Only RSA is accepted, because RS256 is the only algorithm the discovery document
 * advertises. The day Altinn adds an elliptic curve key this check should be
 * widened rather than deleted.
 *
 * @param {JwksDocument|null} keySet - The key set.
 * @returns {boolean} True if at least one complete RSA signing key is present, false otherwise.
 */
function CheckKeySetCanVerifySignatures(keySet) {
    const success = check(keySet, {
        "CheckKeySetCanVerifySignatures - The set holds a complete RSA signing key": (document) =>
            Array.isArray(document?.keys) && document.keys.some((key) =>
                key.kty === "RSA"
                && key.use === "sig"
                && typeof key.kid === "string" && key.kid.length > 0
                && typeof key.n === "string" && key.n.length > 0
                && typeof key.e === "string" && key.e.length > 0),
    });

    if (!success) {
        console.error(`CheckKeySetCanVerifySignatures - key set returned: ${JSON.stringify(keySet)}`);
    }

    return success;
}

export const OpenidDomainChecks = {
    CheckIssuerIsThisEnvironment,
    CheckEndpointsBelongToThisEnvironment,
    CheckSupportedValuesAreListed,
    CheckKeySetCanVerifySignatures,
};
