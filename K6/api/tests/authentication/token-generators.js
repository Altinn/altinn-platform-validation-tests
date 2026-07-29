import { group } from "k6";

import {
    EnterpriseTokenBuilder,
    EnterpriseTokenGenerator,
    expect,
    MaskinportenAccessTokenGenerator,
    MaskinportenTokenBuilder,
    PersonalTokenBuilder,
    PersonalTokenGenerator,
    PlatformTokenBuilder,
    PlatformTokenGenerator,
} from "../../../common-imports.js";
import { getOptions, requireEnv } from "../../../helpers.js";
import { ConsentScope } from "../../../scopes.js";

// The Maskinporten generator signs against test.maskinporten.no, so this only works in TT02.
const ENVIRONMENT = "tt02";
const ORG = "ttd";

// Not in scopes.js — only used here, to request everything the client is provisioned for.
const REQUESTS_WRITE_SCOPE = "altinn:accessmanagement/enduser:requests.write";
const AUTHORIZE_SCOPE = "altinn:authorization/authorize";

// Maskinporten takes the requested scopes space-separated in the grant.
const SCOPES = [
    REQUESTS_WRITE_SCOPE,
    AUTHORIZE_SCOPE,
    ConsentScope.READ,
    ConsentScope.WRITE,
].join(" ");

const label = { step: "token-generators" };

export const options = getOptions([label]);

export function setup() {
    requireEnv([
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
        "MASKINPORTEN_KID",
        "MASKINPORTEN_CLIENT_ID",
        "MASKINPORTEN_CLIENT_PEM",
    ]);
}

/**
 * A token generator is wired up correctly when it knows which endpoint to call
 * and tags its request. Both were broken by the refactor, and neither needs a
 * network call to check.
 *
 * @param {string} name - Generator name, used in the assertion message.
 * @param {object} generator - The generator to inspect.
 * @param {string} expectedGenerator - Expected `token_generator` tag value.
 */
function expectWiredUp(name, generator, expectedGenerator) {
    expect(generator.endpoint, `${name} endpoint`).toBeTruthy();
    expect(generator.tokenRequestOptions.tags, `${name} tags`).toEqual({
        token_generator: expectedGenerator,
        name: generator.endpoint,
        action: "get-token",
    });
}

export default function () {
    group("Generators know their endpoint and tags", () => {
        expectWiredUp(
            "personal",
            new PersonalTokenGenerator(
                new PersonalTokenBuilder().withEnvironment(ENVIRONMENT).build(),
            ),
            "personal-token-generator",
        );

        expectWiredUp(
            "enterprise",
            new EnterpriseTokenGenerator(
                new EnterpriseTokenBuilder().withEnvironment(ENVIRONMENT).build(),
            ),
            "enterprise-token-generator",
        );

        expectWiredUp(
            "platform",
            new PlatformTokenGenerator(new PlatformTokenBuilder().build()),
            "platform-token-generator",
        );
    });

    group("Platform token generator returns a token and caches it", () => {
        const generator = new PlatformTokenGenerator(
            new PlatformTokenBuilder().withEnvironment(ENVIRONMENT).build(),
        );

        const token = generator.getToken();

        expect(token.split("."), "platform token is a JWT").toHaveLength(3);
        expect(generator.getToken(), "platform token is cached").toBe(token);
    });

    group("Enterprise token generator returns a token", () => {
        const generator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(ENVIRONMENT)
                .withOrganization(ORG)
                .withScopes(SCOPES)
                .build(),
        );

        expect(generator.getToken().split("."), "enterprise token is a JWT").toHaveLength(3);
    });

    group("Maskinporten token generator signs with a PEM and caches", () => {
        // Fails with a 400 from Maskinporten if the grant lifetime exceeds 120s.
        const generator = new MaskinportenAccessTokenGenerator(
            new MaskinportenTokenBuilder().withScopes(SCOPES).build(),
        );

        const token = generator.getToken();

        expect(token.split("."), "maskinporten token is a JWT").toHaveLength(3);
        expect(generator.getToken(), "maskinporten token is cached").toBe(token);
    });

    group("Maskinporten rejects a key that is not a PEM", () => {
        expect(
            () =>
                new MaskinportenAccessTokenGenerator(
                    {},
                    "kid",
                    "client-id",
                    "not-a-pem",
                ),
            "non-PEM key",
        ).toThrow();
    });
}
