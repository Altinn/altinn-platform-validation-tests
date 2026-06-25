import http from "k6/http";
import { URL } from "https://jslib.k6.io/url/1.0.0/index.js";
import encoding from "k6/encoding";

const config = {
    altinnTestToolsBaseUrl:
        "https://altinn-testtools-token-generator.azurewebsites.net",
    getEnterpriseTokenUrl:
        "https://altinn-testtools-token-generator.azurewebsites.net/api/GetEnterpriseToken",
    getPersonalTokenUrl:
        "https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken",
    getPlatformAccessTokenUrl:
        "https://altinn-testtools-token-generator.azurewebsites.net/api/GetPlatformAccessToken",
};

class BaseTokenGenerator {
    #cache = new Map();

    constructor({
        endpoint,
        name,
        options,
        optionsClass,
        username = __ENV.TOKEN_GENERATOR_USERNAME,
        password = __ENV.TOKEN_GENERATOR_PASSWORD,
    }) {
        if (!username || !password) {
            throw new Error(
                "TokenGenerator requires a username and password",
            );
        }

        this.endpoint = endpoint;
        this.optionsClass = optionsClass;
        this.tokenGeneratorOptions = new optionsClass(options);

        const encodedCredentials = encoding.b64encode(
            `${username}:${password}`,
        );

        this.tokenRequestOptions = {
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
            },
            tags: {
                tokenGenerator: name,
                name: endpoint,
            },
        };
    }

    setTokenGeneratorOptions(options) {
        this.tokenGeneratorOptions = new this.optionsClass(options);
    }

    getToken() {
        const key = JSON.stringify(
            [...this.tokenGeneratorOptions.entries()]
                .sort(([a], [b]) => a.localeCompare(b)),
        );

        if (this.#cache.has(key)) {
            return this.#cache.get(key);
        }

        const url = new URL(this.endpoint);

        for (const [k, v] of this.tokenGeneratorOptions) {
            url.searchParams.append(k, v);
        }

        const response = http.get(
            url.toString(),
            this.tokenRequestOptions,
        );

        if (response.status !== 200) {
            throw new Error(
                `Failed to get token from ${url}: ${response.status_text}`,
            );
        }

        this.#cache.set(key, response.body);

        return response.body;
    }
}


/**
 * Generates personal tokens by calling the configured token endpoint.
 */
export class PersonalTokenGenerator extends BaseTokenGenerator {
    constructor(options, username, password) {
        super({
            endpoint: config.getPersonalTokenUrl,
            name: "Personal Token Generator",
            options,
            optionsClass: PersonalTokenGeneratorOptions,
            username,
            password,
        });
    }
}

/**
 * Validates allowed query parameters for personal tokens.
 * Extends native Map to store key/value pairs.
 */
export class PersonalTokenGeneratorOptions extends TokenGeneratorOptions {
    static validOptions = [
        "env",
        "scopes",
        "userId",
        "partyId",
        "pid", // What's the difference between ssn and pid?
        "bulkCount",
        "authLvl",
        "consumerOrgNo",
        "partyuuid",
        "userName",
        "clientAmr",
        "ttl",
        "delegationSource",
    ];
}

/**
 * Generates enterprise (Maskinporten) tokens.
 * Works similarly to PersonalTokenGenerator but uses enterprise-specific parameters.
 */
export class EnterpriseTokenGenerator extends BaseTokenGenerator {
    constructor(options, username, password) {
        super({
            endpoint: config.getEnterpriseTokenUrl,
            name: "Enterprise Token Generator",
            options,
            optionsClass: EnterpriseTokenGeneratorOptions,
            username,
            password,
        });
    }
}

/**
 * Validates allowed enterprise-specific query options.
 */
export class EnterpriseTokenGeneratorOptions extends TokenGeneratorOptions {
    static validOptions = [
        "env",
        "scopes",
        "org",
        "orgName", // This is in the README but not on the validator.
        "orgNo",
        "bulkCount",
        "supplierOrgNo",
        "partyId",
        "userId",
        "partyuuid",
        "userName",
        "ttl",
        "delegationSource",
    ];
}

/**
 * Generates platform access tokens — useful for internal Altinn platform calls.
 */
export class PlatformTokenGenerator extends BaseTokenGenerator {
    static platformApp = "k6-e2e-tests";
    static defaultTtl = 60000;

    constructor(options, username, password) {
        super({
            endpoint: config.getPlatformAccessTokenUrl,
            name: "Platform Token Generator",
            options,
            optionsClass: PlatformTokenGeneratorOptions,
            username,
            password,
        });

        this.#applyDefaults();
    }

    setTokenGeneratorOptions(options) {
        super.setTokenGeneratorOptions(options);
        this.#applyDefaults();
    }

    #applyDefaults() {
        if (!this.tokenGeneratorOptions.has("app")) {
            this.tokenGeneratorOptions.set(
                "app",
                PlatformTokenGenerator.platformApp,
            );
        }

        if (!this.tokenGeneratorOptions.has("ttl")) {
            this.tokenGeneratorOptions.set(
                "ttl",
                PlatformTokenGenerator.defaultTtl,
            );
        }
    }
}

/**
 * Internal validation for allowed platform token options.
 */
export class PlatformTokenGeneratorOptions extends TokenGeneratorOptions {
    static validOptions = [
        "env",
        "app",
        "ttl",
    ];
}


/**
 * Base class for validating token generator options.
 */
export class TokenGeneratorOptions extends Map {
    static validOptions = [];

    constructor(options) {
        super(options);

        const validOptions = new Set(this.constructor.validOptions);

        for (const key of this.keys()) {
            if (!validOptions.has(key)) {
                throw new Error(
                    `TokenGeneratorOptions: "${key}" is not a valid option`,
                );
            }
        }
    }

    static isValidTokenOption(key) {
        return new Set(this.validOptions).has(key);
    }
}
