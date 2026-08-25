import { URL } from "https://jslib.k6.io/url/1.0.0/index.js";
import encoding from "k6/encoding";
import http from "k6/http";

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

/**
 * Query parameters the token generator takes for a personal token. Every value
 * ends up in the query string, so the numeric ones are accepted as strings too,
 * which is how they come out of a csv fixture.
 *
 * @typedef {object} PersonalTokenOptions
 * @property {string} [env] Environment the token is issued for.
 * @property {string} [scopes] Space separated scopes.
 * @property {string|number} [userId] Altinn user id.
 * @property {string|number} [partyId] Altinn party id.
 * @property {string} [pid] Person identifier, 11 digits.
 * @property {string|number} [bulkCount] Number of tokens to ask for in one call.
 * @property {string|number} [authLvl] Authentication level.
 * @property {string} [consumerOrgNo] Organisation number of the consumer.
 * @property {string} [partyuuid] Party UUID.
 * @property {string} [userName] Self identified user name.
 * @property {string} [clientAmr] Client authentication method.
 * @property {string|number} [ttl] Lifetime in seconds.
 * @property {string} [delegationSource] Source system of the delegation.
 */

/**
 * Query parameters the token generator takes for an enterprise token.
 *
 * @typedef {object} EnterpriseTokenOptions
 * @property {string} [env] Environment the token is issued for.
 * @property {string} [scopes] Space separated scopes.
 * @property {string} [org] Organisation the token acts as.
 * @property {string} [orgName] Name of that organisation.
 * @property {string} [orgNo] Organisation number, 9 digits.
 * @property {string} [supplierOrgNo] Organisation number of the supplier.
 * @property {string|number} [partyId] Altinn party id.
 * @property {string|number} [userId] Altinn user id.
 * @property {string} [partyuuid] Party UUID.
 * @property {string} [userName] Self identified user name.
 * @property {string|number} [ttl] Lifetime in seconds.
 * @property {string} [delegationSource] Source system of the delegation.
 */

/**
 * Query parameters the token generator takes for a platform access token.
 *
 * @typedef {object} PlatformTokenOptions
 * @property {string} [env] Environment the token is issued for.
 * @property {string} [app] Application the token is issued for.
 * @property {string} [org] Organisation the token acts as.
 * @property {string|number} [ttl] Lifetime in seconds.
 */

/**
 * @typedef {PersonalTokenOptions|EnterpriseTokenOptions|PlatformTokenOptions} TokenGeneratorOptions
 */

const PERSONAL_TOKEN_TAGS = {
    getToken: {
        token_generator: "personal-token-generator",
        name: config.getPersonalTokenUrl,
        action: "get-token",
    },
};

const ENTERPRISE_TOKEN_TAGS = {
    getToken: {
        token_generator: "enterprise-token-generator",
        name: config.getEnterpriseTokenUrl,
        action: "get-token",
    },
};

const PLATFORM_TOKEN_TAGS = {
    getToken: {
        token_generator: "platform-token-generator",
        name: config.getPlatformAccessTokenUrl,
        action: "get-token",
    },
};

/**
 * Base token generator. Shared by the personal, enterprise and platform
 * generators, which differ only in endpoint and tags.
 *
 * Options are sent as query parameters; any option with an `undefined` value is
 * left out. Tokens are cached per option set for the lifetime of the VU.
 */
class BaseTokenGenerator {
    #cache = new Map();

    /**
     * @param {{endpoint: string, tags: {[key: string]: string}, options?: TokenGeneratorOptions, username?: string, password?: string}} config - Generator configuration.
     * @throws {Error} When username or password is missing.
     */
    constructor({
        endpoint,
        tags,
        options,
        username = __ENV.TOKEN_GENERATOR_USERNAME,
        password = __ENV.TOKEN_GENERATOR_PASSWORD,
    }) {
        if (!username || !password) {
            throw new Error(
                "TokenGenerator requires a username and password",
            );
        }

        this.endpoint = endpoint;
        this.tokenGeneratorOptions = options ?? {};

        const encodedCredentials = encoding.b64encode(
            `${username}:${password}`,
        );

        this.tokenRequestOptions = {
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
            },
            tags: tags
        };
    }

    /**
     * @param {TokenGeneratorOptions} options - Replacement options from the matching builder.
     */
    setTokenGeneratorOptions(options) {
        this.tokenGeneratorOptions = options;
    }

    /**
     * Makes sure a token is cached for the current options.
     *
     * These generators fetch synchronously, so this just delegates to
     * {@link getToken}. It exists so callers can hold any generator to the same
     * contract, await ensureToken once and then read getToken inline. See
     * MaskinportenAccessTokenGenerator, which signs its grant with SubtleCrypto and
     * therefore has no synchronous way to obtain a token.
     *
     * @returns {Promise<string>} The token, as returned by the endpoint.
     * @throws {Error} If the endpoint does not answer 200.
     */
    async ensureToken() {
        return this.getToken();
    }

    /**
     * Returns a token for the current options, cached per option set.
     *
     * @returns {string} The token, as returned by the endpoint.
     * @throws {Error} If the endpoint does not answer 200.
     */
    getToken() {
        const entries = Object.entries(this.tokenGeneratorOptions)
            .filter(([, value]) => value !== undefined);

        const cacheKey = JSON.stringify(
            entries.sort(([a], [b]) => a.localeCompare(b)),
        );

        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey);
        }

        const url = new URL(this.endpoint);

        for (const [key, value] of entries) {
            url.searchParams.append(key, value);
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

        const token = String(response.body);

        this.#cache.set(cacheKey, token);

        return token;
    }
}

/**
 * Personal token builder.
 *
 * Each `withX` maps to one query parameter: `withEnvironment` → `env`,
 * `withAuthLevel` → `authLvl`, `withUsername` → `userName`,
 * `withConsumerOrganizationNumber` → `consumerOrgNo`, `withPartyUuid` →
 * `partyuuid`; the rest match their names.
 *
 * Starts out with `env` from `__ENV.ENVIRONMENT` and `ttl` 3600, since nearly
 * every call site wants those — override with `withEnvironment` / `withTtl`.
 */
export class PersonalTokenBuilder {
    constructor() {
        this.options = /** @type {PersonalTokenOptions} */ ({});
        this.options.env = __ENV.ENVIRONMENT;
        this.options.ttl = 3600;
    }

    withEnvironment(environment) {
        this.options.env = environment;
        return this;
    }

    withScopes(scopes) {
        this.options.scopes = scopes;
        return this;
    }

    withUserId(userId) {
        this.options.userId = userId;
        return this;
    }

    withPartyId(partyId) {
        this.options.partyId = partyId;
        return this;
    }

    withPid(pid) {
        this.options.pid = pid;
        return this;
    }

    withBulkCount(count) {
        this.options.bulkCount = count;
        return this;
    }

    withAuthLevel(level) {
        this.options.authLvl = level;
        return this;
    }

    withConsumerOrganizationNumber(orgNo) {
        this.options.consumerOrgNo = orgNo;
        return this;
    }

    withPartyUuid(uuid) {
        this.options.partyuuid = uuid;
        return this;
    }

    withUsername(username) {
        this.options.userName = username;
        return this;
    }

    withClientAmr(clientAmr) {
        this.options.clientAmr = clientAmr;
        return this;
    }

    withTtl(ttl) {
        this.options.ttl = ttl;
        return this;
    }

    withDelegationSource(source) {
        this.options.delegationSource = source;
        return this;
    }

    /**
     * @returns {PersonalTokenOptions} The built options, to pass to the generator.
     */
    build() {
        return { ...this.options };
    }
}

/**
 * Enterprise token builder.
 *
 * Each `withX` maps to one query parameter: `withEnvironment` → `env`,
 * `withOrganization` → `org`, `withOrganizationNumber` → `orgNo`,
 * `withSupplierOrganizationNumber` → `supplierOrgNo`, `withUsername` →
 * `userName`, `withPartyUuid` → `partyuuid`; the rest match their names.
 *
 * Starts out with `env` from `__ENV.ENVIRONMENT` and `ttl` 3600, since nearly
 * every call site wants those — override with `withEnvironment` / `withTtl`.
 */
export class EnterpriseTokenBuilder {
    constructor() {
        this.options = /** @type {EnterpriseTokenOptions} */ ({});
        this.options.env = __ENV.ENVIRONMENT;
        this.options.ttl = 3600;
    }

    withEnvironment(environment) {
        this.options.env = environment;
        return this;
    }

    withScopes(scopes) {
        this.options.scopes = scopes;
        return this;
    }

    withOrganization(organization) {
        this.options.org = organization;
        return this;
    }

    withOrganizationName(name) {
        this.options.orgName = name;
        return this;
    }

    withOrganizationNumber(orgNo) {
        this.options.orgNo = orgNo;
        return this;
    }

    withSupplierOrganizationNumber(orgNo) {
        this.options.supplierOrgNo = orgNo;
        return this;
    }

    withPartyId(partyId) {
        this.options.partyId = partyId;
        return this;
    }

    withUserId(userId) {
        this.options.userId = userId;
        return this;
    }

    withPartyUuid(uuid) {
        this.options.partyuuid = uuid;
        return this;
    }

    withUsername(username) {
        this.options.userName = username;
        return this;
    }

    withTtl(ttl) {
        this.options.ttl = ttl;
        return this;
    }

    withDelegationSource(source) {
        this.options.delegationSource = source;
        return this;
    }

    /**
     * @returns {EnterpriseTokenOptions} The built options, to pass to the generator.
     */
    build() {
        return { ...this.options };
    }
}

/**
 * Platform token builder.
 *
 * `withEnvironment` → `env`, `withApplication` → `app`,
 * `withOrganization` → `org`, `withTtl` → `ttl`.
 *
 * Starts out with `app` and `ttl` from the statics below. Unlike the personal
 * and enterprise builders it does not default `env` — pass it explicitly.
 *
 * `org` sets the issuer of the token. Leave it out and the token generator uses
 * its own default issuer. Set it for APIs that read the calling app out of the
 * token, since they build the identifier as `app_{issuer}_{app}`.
 */
export class PlatformTokenBuilder {
    static defaultApp = "k6-e2e-tests";
    static defaultTtl = 60000;

    constructor() {
        this.options = {
            app: PlatformTokenBuilder.defaultApp,
            ttl: PlatformTokenBuilder.defaultTtl,
        };
    }

    withEnvironment(environment) {
        this.options.env = environment;
        return this;
    }

    withApplication(application) {
        this.options.app = application;
        return this;
    }

    withOrganization(organization) {
        this.options.org = organization;
        return this;
    }

    withTtl(ttl) {
        this.options.ttl = ttl;
        return this;
    }

    /**
     * @returns {PlatformTokenOptions} The built options, to pass to the generator.
     */
    build() {
        return { ...this.options };
    }
}

/**
 * Personal token generator.
 */
export class PersonalTokenGenerator extends BaseTokenGenerator {
    /**
     * @param {TokenGeneratorOptions} [options] - Built options from the matching builder.
     * @param {string} [username] - Basic auth username; defaults to __ENV.TOKEN_GENERATOR_USERNAME.
     * @param {string} [password] - Basic auth password; defaults to __ENV.TOKEN_GENERATOR_PASSWORD.
     */
    constructor(options, username, password) {
        super({
            endpoint: config.getPersonalTokenUrl,
            tags: PERSONAL_TOKEN_TAGS.getToken,
            options,
            username,
            password,
        });
    }

    /**
     * @returns {typeof PERSONAL_TOKEN_TAGS} The tags this generator puts on its requests, for use in threshold labels.
     */
    static get TAGS() {
        return PERSONAL_TOKEN_TAGS;
    }
}

/**
 * Enterprise token generator.
 */
export class EnterpriseTokenGenerator extends BaseTokenGenerator {
    /**
     * @param {TokenGeneratorOptions} [options] - Built options from the matching builder.
     * @param {string} [username] - Basic auth username; defaults to __ENV.TOKEN_GENERATOR_USERNAME.
     * @param {string} [password] - Basic auth password; defaults to __ENV.TOKEN_GENERATOR_PASSWORD.
     */
    constructor(options, username, password) {
        super({
            endpoint: config.getEnterpriseTokenUrl,
            tags: ENTERPRISE_TOKEN_TAGS.getToken,
            options,
            username,
            password,
        });
    }

    /**
     * @returns {typeof ENTERPRISE_TOKEN_TAGS} The tags this generator puts on its requests, for use in threshold labels.
     */
    static get TAGS() {
        return ENTERPRISE_TOKEN_TAGS;
    }
}

/**
 * Platform token generator.
 */
export class PlatformTokenGenerator extends BaseTokenGenerator {
    /**
     * @param {TokenGeneratorOptions} [options] - Built options from the matching builder.
     * @param {string} [username] - Basic auth username; defaults to __ENV.TOKEN_GENERATOR_USERNAME.
     * @param {string} [password] - Basic auth password; defaults to __ENV.TOKEN_GENERATOR_PASSWORD.
     */
    constructor(options, username, password) {
        super({
            endpoint: config.getPlatformAccessTokenUrl,
            tags: PLATFORM_TOKEN_TAGS.getToken,
            options,
            username,
            password,
        });
    }

    /**
     * @returns {typeof PLATFORM_TOKEN_TAGS} The tags this generator puts on its requests, for use in threshold labels.
     */
    static get TAGS() {
        return PLATFORM_TOKEN_TAGS;
    }
}
