import http from "k6/http";
import encoding from "k6/encoding";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import KJUR from "https://unpkg.com/jsrsasign@10.8.6/lib/jsrsasign.js";
import { TokenGeneratorOptions } from "./token-generator.js";

const config = {
    maskinportenBaseUrl: "https://test.maskinporten.no",
    audienceUrl: "https://test.maskinporten.no/",
    tokenUrl: "https://test.maskinporten.no/token",
};

/**
 * Generates Maskinporten access tokens using a JWT Bearer Assertion.
 */
export class MaskinportenAccessTokenGenerator {
    #machineportenKid;
    #machineportenClientId;
    #encodedJwk;
    #cache = new Map();

    /**
     * @param {MaskinportenTokenGeneratorOptions} tokenGeneratorOptions
     * @param {string} [machineportenKid=__ENV.MACHINEPORTEN_KID] – Key ID for the JWK used to sign JWTs.
     * @param {string} [machineportenClientId=__ENV.MACHINEPORTEN_CLIENT_ID] – Maskinporten client ID.
     * @param {string} [encodedJwk=__ENV.ENCODED_JWK] – Base64-encoded JWK containing private key.
     * @throws {Error} When required env values are missing.
     */
    constructor(
        tokenGeneratorOptions,
        machineportenKid = __ENV.MACHINEPORTEN_KID,
        machineportenClientId = __ENV.MACHINEPORTEN_CLIENT_ID,
        encodedJwk = __ENV.ENCODED_JWK,
    ) {
        if (
            machineportenKid === undefined ||
            machineportenClientId === undefined ||
            encodedJwk === undefined
        ) {
            throw new Error(
                "MaskinportenAccessTokenGenerator requires a maskinporten kid, client_id and an encoded jwk",
            );
        }

        this.#machineportenKid = machineportenKid;
        this.#machineportenClientId = machineportenClientId;
        this.#encodedJwk = encodedJwk;

        this.tokenGeneratorOptions = tokenGeneratorOptions;

        this.requestParams = {
            tags: {
                tokenGenerator: "Maskinporten Token Generator",
                name: config.tokenUrl,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };
    }

    /**
     * Replace current options.
     * @param {MaskinportenTokenGeneratorOptions} tokenGeneratorOptions
     */
    setTokenGeneratorOptions(tokenGeneratorOptions) {
        this.tokenGeneratorOptions = tokenGeneratorOptions;
    }

    /**
     * Returns a cached token if still valid, otherwise generates a new one.
     * @returns {string}
     */
    getToken() {
        const scopes = this.tokenGeneratorOptions.get("scopes");

        const cacheKey = `${this.#machineportenClientId}:${scopes}`;
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
     * Build and POST a JWT Bearer grant to the token endpoint to get a Maskinporten access token.
     * @private
     * @param {string} scopes – Space-separated list of scopes to request.
     * @returns {string} A Maskinporten access token.
     * @throws {Error} If the HTTP request fails or the response cannot be parsed.
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
     * Create a signed JWT assertion for a JWT Bearer OAuth2 grant.
     * @private
     * @param {string} scopes – Requested scopes.
     * @returns {string} A signed JWT.
     */
    #createJwtGrant(scopes) {
        const header = {
            alg: "RS256",
            typ: "JWT",
            kid: this.#machineportenKid,
        };

        const now = Math.floor(Date.now() / 1000); // in seconds

        const payload = {
            aud: config.audienceUrl,
            scope: scopes,
            iss: this.#machineportenClientId,
            iat: now,
            exp: now + 600,
            jti: uuidv4(),
        };

        return KJUR.jws.JWS.sign(
            "RS256",
            header,
            payload,
            JSON.parse(
                encoding.b64decode(this.#encodedJwk, "std", "s"),
            ),
        );
    }

    /**
     * Extract expiration timestamp from JWT.
     * @private
     * @param {string} token
     * @returns {number}
     */
    #getExpirationTimestamp(token) {
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

            const expirationTimestamp = payload.exp * 1000;

            if (expirationTimestamp <= Date.now()) {
                throw new Error(
                    "Received token is already expired or has an invalid expiration date",
                );
            }

            return expirationTimestamp;
        } catch (e) {
            throw new Error(
                `Failed to decode JWT payload for expiration: ${e.message}`,
                { cause: e },
            );
        }
    }
}

/**
 * Validates Maskinporten token generator options.
 * Only `'scopes'` is permitted.
 */
export class MaskinportenTokenGeneratorOptions extends TokenGeneratorOptions {
    static validOptions = ["scopes"];
}
