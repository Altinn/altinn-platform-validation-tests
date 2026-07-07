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
 * Base token generator.
 */
class BaseTokenGenerator {
    #cache = new Map();

    constructor({
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

    setTokenGeneratorOptions(options) {
        this.tokenGeneratorOptions = options;
    }

    getToken() {
        const entries = Object.entries(this.tokenGeneratorOptions)
            .filter(([, value]) => value !== undefined);

        const key = JSON.stringify(
            entries.sort(([a], [b]) => a.localeCompare(b)),
        );

        if (this.#cache.has(key)) {
            return this.#cache.get(key);
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

        this.#cache.set(key, response.body);

        return response.body;
    }
}


/**
 * Personal token builder.
 */
export class PersonalTokenBuilder {
    constructor() {
        this.options = {};
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

    build() {
        return { ...this.options };
    }
}


/**
 * Enterprise token builder.
 */
export class EnterpriseTokenBuilder {
    constructor() {
        this.options = {};
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

    build() {
        return { ...this.options };
    }
}


/**
 * Platform token builder.
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

    withTtl(ttl) {
        this.options.ttl = ttl;
        return this;
    }

    build() {
        return { ...this.options };
    }
}


/**
 * Personal token generator.
 */
export class PersonalTokenGenerator extends BaseTokenGenerator {
    constructor(options, username, password) {
        super({
            tags: PERSONAL_TOKEN_TAGS.get_token,
            options,
            username,
            password,
        });
    }

    static get TAGS() {
        return PERSONAL_TOKEN_TAGS;
    }
}


/**
 * Enterprise token generator.
 */
export class EnterpriseTokenGenerator extends BaseTokenGenerator {
    constructor(options, username, password) {
        super({
            tags: ENTERPRISE_TOKEN_TAGS.get_token,
            options,
            username,
            password,
        });
    }

    static get TAGS() {
        return ENTERPRISE_TOKEN_TAGS;
    }
}


/**
 * Platform token generator.
 */
export class PlatformTokenGenerator extends BaseTokenGenerator {
    constructor(options, username, password) {
        super({
            tags: PLATFORM_TOKEN_TAGS.get_token,
            options,
            username,
            password,
        });
    }

    static get TAGS() {
        return PLATFORM_TOKEN_TAGS;
    }
}
