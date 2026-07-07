import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import KJUR from "https://unpkg.com/jsrsasign@10.8.6/lib/jsrsasign.js";
import encoding from "k6/encoding";
import http from "k6/http";

const config = {
    maskinportenBaseUrl: "https://test.maskinporten.no",
    audienceUrl: "https://test.maskinporten.no/",
    tokenUrl: "https://test.maskinporten.no/token",
};

const TAGS = {
    getToken: {
        token_generator: "maskinporten-token-generator",
        name: config.tokenUrl,
        action: "get-token"
    },
};

/**
 * Builder for Maskinporten token options.
 */
export class MaskinportenTokenBuilder {
    constructor() {
        this.options = {};
    }

    withScopes(scopes) {
        this.options.scopes = scopes;
        return this;
    }

    build() {
        return { ...this.options };
    }
}

/**
 * Generates Maskinporten access tokens using a JWT Bearer Assertion.
 */
export class MaskinportenAccessTokenGenerator {
    #machineportenKid;
    #machineportenClientId;
    #encodedJwk;
    #cache = new Map();

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

        this.tokenGeneratorOptions = tokenGeneratorOptions ?? {};

        this.requestParams = {
            tags: TAGS.getToken,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };
    }

    setTokenGeneratorOptions(tokenGeneratorOptions) {
        this.tokenGeneratorOptions = tokenGeneratorOptions;
    }

    getToken() {
        const scopes = this.tokenGeneratorOptions.scopes;

        const cacheKey = `${this.#machineportenClientId}:${scopes} `;
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
                `Failed to generate Maskinporten token: ${response.body} `,
            );
        }

        try {
            return JSON.parse(response.body).access_token;
        } catch (e) {
            throw new Error(
                `Unable to parse Maskinporten token: ${e.message} `,
                { cause: e },
            );
        }
    }

    #createJwtGrant(scopes) {
        const header = {
            alg: "RS256",
            typ: "JWT",
            kid: this.#machineportenKid,
        };

        const now = Math.floor(Date.now() / 1000);

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
                `Failed to decode JWT payload for expiration: ${e.message} `,
                { cause: e },
            );
        }
    }
}
