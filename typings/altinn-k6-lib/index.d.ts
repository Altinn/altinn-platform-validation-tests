declare module 'https://github.com/Altinn/altinn-platform/releases/download/altinn-k6-lib-0.0.9/index.js' {
    export type TokenOptionValue = string | number | boolean;

    /**
     * All possible token option keys across generators
     */
    export type PersonalTokenOptionKey =
        | 'env'
        | 'scopes'
        | 'userId'
        | 'partyId'
        | 'pid'
        | 'bulkCount'
        | 'authLvl'
        | 'consumerOrgNo'
        | 'partyuuid'
        | 'userName'
        | 'clientAmr'
        | 'ttl'
        | 'delegationSource';

    export type EnterpriseTokenOptionKey =
        | 'env'
        | 'scopes'
        | 'org'
        | 'orgName'
        | 'orgNo'
        | 'bulkCount'
        | 'supplierOrgNo'
        | 'partyId'
        | 'userId'
        | 'partyuuid'
        | 'userName'
        | 'ttl'
        | 'delegationSource';

    export type PlatformTokenOptionKey =
        | 'env'
        | 'app'
        | 'ttl';

    /**
     * Generic iterable input format used in constructors
     */
    export type TokenOptions<K extends string = string> =
        | Iterable<[K, TokenOptionValue]>
        | Record<K, TokenOptionValue>;

    /**
     * Common HTTP options used internally
     */
    export interface TokenRequestOptions {
        headers: Record<string, string>;
        tags: {
            name: string;
        };
    }

    /**
     * Base shape of option maps
     */
    export class PersonalTokenGeneratorOptions extends Map<
        PersonalTokenOptionKey,
        TokenOptionValue
    > {
        constructor(
            options?: Iterable<[PersonalTokenOptionKey, TokenOptionValue]>
        );

        static isValidTokenOption(key: string): key is PersonalTokenOptionKey;
    }

    export class EnterpriseTokenGeneratorOptions extends Map<
        EnterpriseTokenOptionKey,
        TokenOptionValue
    > {
        constructor(
            options?: Iterable<[EnterpriseTokenOptionKey, TokenOptionValue]>
        );

        static isValidTokenOption(key: string): key is EnterpriseTokenOptionKey;
    }

    export class PlatformTokenGeneratorOptions extends Map<
        PlatformTokenOptionKey,
        TokenOptionValue
    > {
        constructor(
            options?: Iterable<[PlatformTokenOptionKey, TokenOptionValue]>
        );

        static isValidTokenOption(key: string): key is PlatformTokenOptionKey;
    }

    /**
     * PERSONAL TOKEN GENERATOR
     */
    export class PersonalTokenGenerator {
        constructor(
            tokenGeneratorOptions?: TokenOptions<PersonalTokenOptionKey>,
            username?: string,
            password?: string
        );

        tokenRequestOptions: TokenRequestOptions;
        tokenGeneratorOptions: PersonalTokenGeneratorOptions;

        setTokenGeneratorOptions(
            tokenGeneratorOptions: TokenOptions<PersonalTokenOptionKey>
        ): void;

        /**
         * Memoized token getter
         */
        getToken: () => string;
    }

    /**
     * ENTERPRISE TOKEN GENERATOR
     */
    export class EnterpriseTokenGenerator {
        constructor(
            tokenGeneratorOptions?: TokenOptions<EnterpriseTokenOptionKey>,
            username?: string,
            password?: string
        );

        tokenRequestOptions: TokenRequestOptions;
        tokenGeneratorOptions: EnterpriseTokenGeneratorOptions;

        setTokenGeneratorOptions(
            tokenGeneratorOptions: TokenOptions<EnterpriseTokenOptionKey>
        ): void;

        getToken: () => string;
    }

    /**
     * PLATFORM TOKEN GENERATOR
     */
    export class PlatformTokenGenerator {
        constructor(
            tokenGeneratorOptions?: TokenOptions<PlatformTokenOptionKey>,
            username?: string,
            password?: string
        );

        tokenRequestOptions: TokenRequestOptions;
        tokenGeneratorOptions: PlatformTokenGeneratorOptions;

        setTokenGeneratorOptions(
            tokenGeneratorOptions: TokenOptions<PlatformTokenOptionKey>
        ): void;

        getToken: () => string;
    }

    // maskinporten_token_generator.d.ts

    /**
     * Only valid option for Maskinporten
     */
    export type MaskinportenTokenOptionKey = 'scopes';

    /**
     * Input format accepted by constructor
     */
    export type MaskinportenTokenOptions =
        | Iterable<[MaskinportenTokenOptionKey, TokenOptionValue]>
        | Record<MaskinportenTokenOptionKey, TokenOptionValue>;

    /**
     * Internal representation of cached token
     */
    export interface CachedMaskinportenToken {
        token: string;
        expiresAt: number; // epoch ms
    }

    /**
     * Strongly typed options map
     */
    export class MaskinportenTokenGeneratorOptions extends Map<
        MaskinportenTokenOptionKey,
        TokenOptionValue
    > {
        constructor(
            options?: Iterable<[MaskinportenTokenOptionKey, TokenOptionValue]>
        );

        static isValidConfigOption(
            key: string
        ): key is MaskinportenTokenOptionKey;
    }

    /**
     * Generator for Maskinporten access tokens using JWT Bearer flow
     */
    export class MaskinportenAccessTokenGenerator {
        constructor(
            tokenGeneratorOptions?: MaskinportenTokenOptions,
            machineportenKid?: string,
            machineportenClientId?: string,
            encodedJwk?: string
        );

        /**
         * Validated and normalized options
         */
        tokenGeneratorOptions: MaskinportenTokenGeneratorOptions;

        /**
         * Returns a cached or freshly generated token
         */
        getToken: () => string;
    }
}
