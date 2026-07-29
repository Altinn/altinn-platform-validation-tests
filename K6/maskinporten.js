import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import KJUR from "https://unpkg.com/jsrsasign@10.8.6/lib/jsrsasign.js";
import encoding from "k6/encoding";
import http from "k6/http";

const config = {
    maskinportenBaseUrl: "https://test.maskinporten.no",
    audienceUrl: "https://test.maskinporten.no/",
    tokenUrl: "https://test.maskinporten.no/token",
};

// Maskinporten caps the JWT grant lifetime at 120 seconds; leave room for clock skew.
const ASSERTION_LIFETIME_SECONDS = 100;

const TAGS = {
    getToken: {
        token_generator: "maskinporten-token-generator",
        name: config.tokenUrl,
        action: "get-token"
    },
};

/**
 * Builder for Maskinporten token options.
 *
 * `withScopes` maps to the `scope` claim of the JWT grant. Maskinporten takes
 * several scopes as one space-separated string.
 */
export class MaskinportenTokenBuilder {
    constructor() {
        this.options = {};
    }

    /**
     * @param {string} scopes - Space-separated scopes to request.
     * @returns {MaskinportenTokenBuilder} This builder, for chaining.
     */
    withScopes(scopes) {
        this.options.scopes = scopes;
        return this;
    }

    /**
     * @returns {object} The built options, to pass to the generator.
     */
    build() {
        return { ...this.options };
    }
}

/**
 * Generates Maskinporten access tokens using a JWT Bearer Assertion.
 */
export class MaskinportenAccessTokenGenerator {
    #maskinportenKid;
    #maskinportenClientId;
    #clientPem;
    #cache = new Map();

    /**
     * @param {object} tokenGeneratorOptions - Options from {@link MaskinportenTokenBuilder}; `scopes` is the only one used.
     * @param {string} [maskinportenKid=__ENV.MASKINPORTEN_KID] - Key ID of the key registered on the Maskinporten client.
     * @param {string} [maskinportenClientId=__ENV.MASKINPORTEN_CLIENT_ID] - Maskinporten client ID, used as the `iss` claim.
     * @param {string} [clientPem=__ENV.MASKINPORTEN_CLIENT_PEM] - The client's private key as PEM. Quote it in .env so the newlines survive sourcing; literal `\n` sequences are converted back to real line breaks.
     * @throws {Error} When any of the three values is missing, or the key is not a PEM.
     */
    constructor(
        tokenGeneratorOptions,
        maskinportenKid = __ENV.MASKINPORTEN_KID,
        maskinportenClientId = __ENV.MASKINPORTEN_CLIENT_ID,
        clientPem = __ENV.MASKINPORTEN_CLIENT_PEM,
    ) {
        if (!maskinportenKid || !maskinportenClientId || !clientPem) {
            throw new Error(
                "MaskinportenAccessTokenGenerator requires MASKINPORTEN_KID, MASKINPORTEN_CLIENT_ID and MASKINPORTEN_CLIENT_PEM",
            );
        }

        // Secret stores and .env files sometimes flatten the newlines in a PEM;
        // jsrsasign needs the real line breaks back.
        const normalizedPem = clientPem.replace(/\\n/g, "\n").trim();

        if (!normalizedPem.startsWith("-----BEGIN")) {
            throw new Error(
                "MASKINPORTEN_CLIENT_PEM must be a PEM private key (-----BEGIN ...)",
            );
        }

        this.#maskinportenKid = maskinportenKid;
        this.#maskinportenClientId = maskinportenClientId;
        this.#clientPem = normalizedPem;

        this.tokenGeneratorOptions = tokenGeneratorOptions ?? {};

        this.requestParams = {
            tags: TAGS.getToken,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };
    }

    /**
     * @returns {object} The tags this generator puts on its requests, for use in threshold labels.
     */
    static get TAGS() {
        return TAGS;
    }

    /**
     * @param {object} tokenGeneratorOptions - Replacement options from {@link MaskinportenTokenBuilder}.
     */
    setTokenGeneratorOptions(tokenGeneratorOptions) {
        this.tokenGeneratorOptions = tokenGeneratorOptions;
    }

    /**
     * Returns an access token for the configured scopes, cached per client ID and
     * scope set until it expires.
     *
     * @returns {string} A Maskinporten access token.
     */
    getToken() {
        const scopes = this.tokenGeneratorOptions.scopes;

        const cacheKey = `${this.#maskinportenClientId}:${scopes}`;
        const cached = this.#cache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
            return cached.token;
        }

        const token = this.#generateAccessToken(scopes);

        this.#cache.set(cacheKey, {
            token,
            expiresAt: this.#getExpirationTimestamp(token),
        });

        return token;
    }

    /**
     * POSTs a JWT Bearer grant to the token endpoint.
     *
     * @param {string} scopes - Space-separated scopes to request.
     * @returns {string} The access token from the response.
     * @throws {Error} If the request fails or the response cannot be parsed.
     * @private
     */
    #generateAccessToken(scopes) {
        const grant = this.#createJwtGrant(scopes);

        const body = {
            alg: "RS256",
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: grant,
        };

        const response = http.post(
            config.tokenUrl,
            body,
            this.requestParams,
        );

        if (response.status !== 200) {
            throw new Error(
                `Failed to generate Maskinporten token: ${response.body}`,
            );
        }

        try {
            return JSON.parse(response.body).access_token;
        } catch (e) {
            throw new Error(
                `Unable to parse Maskinporten token: ${e.message}`,
                { cause: e },
            );
        }
    }

    /**
     * Signs the JWT assertion used as the OAuth2 JWT Bearer grant.
     *
     * @param {string} scopes - Space-separated scopes to put in the `scope` claim.
     * @returns {string} The signed JWT.
     * @private
     */
    #createJwtGrant(scopes) {
        const header = {
            alg: "RS256",
            typ: "JWT",
            kid: this.#maskinportenKid,
        };

        const now = Math.floor(Date.now() / 1000);

        const payload = {
            aud: config.audienceUrl,
            scope: scopes,
            iss: this.#maskinportenClientId,
            iat: now,
            // Maskinporten rejects assertions where exp - iat exceeds 120s.
            // This is the lifetime of the grant, not of the access token it returns.
            exp: now + ASSERTION_LIFETIME_SECONDS,
            jti: uuidv4(),
        };

        return KJUR.jws.JWS.sign("RS256", header, payload, this.#clientPem);
    }

    /**
     * Reads the `exp` claim of an access token, for cache eviction.
     *
     * @param {string} token - The access token to inspect.
     * @returns {number} Expiry as a Unix timestamp in milliseconds.
     * @throws {Error} If the payload cannot be decoded, or the token is already expired.
     * @private
     */
    #getExpirationTimestamp(token) {
        let expirationTimestamp;

        try {
            const payloadSegment = token.split(".")[1];

            const base64 = payloadSegment
                .replace(/-/g, "+")
                .replace(/_/g, "/")
                .padEnd(
                    4 * Math.ceil(payloadSegment.length / 4),
                    "=",
                );

            const payload = JSON.parse(
                encoding.b64decode(base64, "std", "s"),
            );

            expirationTimestamp = payload.exp * 1000;
        } catch (e) {
            throw new Error(
                `Failed to decode JWT payload for expiration: ${e.message}`,
                { cause: e },
            );
        }

        if (expirationTimestamp <= Date.now()) {
            throw new Error(
                "Received token is already expired or has an invalid expiration date",
            );
        }

        return expirationTimestamp;
    }
}
