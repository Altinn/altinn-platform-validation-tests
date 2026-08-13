import { check, group } from "k6";

import {
    EnterpriseTokenBuilder,
    EnterpriseTokenGenerator,
    MaskinportenAccessTokenGenerator,
    MaskinportenTokenBuilder,
    PlatformTokenBuilder,
    PlatformTokenGenerator,
} from "../../../common-imports.js";
import { getOptions, requireEnv } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";

// The generators tag their own requests with token_generator, not with the step
// label, so collect the timings under those tags to see how long each one took.
export const options = getOptions([
    { token_generator: EnterpriseTokenGenerator.TAGS.getToken.token_generator },
    { token_generator: PlatformTokenGenerator.TAGS.getToken.token_generator },
    { token_generator: MaskinportenAccessTokenGenerator.TAGS.getToken.token_generator, },
]);

export function setup() {
    requireEnv([
        "ENVIRONMENT",
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
        "MASKINPORTEN_KID",
        "MASKINPORTEN_CLIENT_ID",
        "MASKINPORTEN_CLIENT_PEM",
    ]);

    if (__ENV.ENVIRONMENT !== "tt02") {
        throw new Error(
            "The Maskinporten generator signs against test.maskinporten.no, so this only works in TT02.",
        );
    }
}

export default async function () {
    const ORG = "ttd";
    // Maskinporten takes the requested scopes space-separated in the grant.
    const scopes = CreateScopeString([
        AltinnScopes.ACCESSMANAGEMENT.ENDUSER.REQUESTS.WRITE,
        AltinnScopes.CONSENTREQUESTS.READ,
        AltinnScopes.CONSENTREQUESTS.WRITE
    ]);

    // Every generator is set up the same way. ensureToken is awaited outside the
    // groups, since group() takes a synchronous callback.
    const platformGenerator = new PlatformTokenGenerator(
        new PlatformTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .build(),
    );

    await platformGenerator.ensureToken();

    group("Platform token", () => {
        check(platformGenerator.getToken(), {
            "got a platform token": (token) => token.length > 0,
        });
    });

    const enterpriseGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withOrganization(ORG)
            .withScopes(scopes)
            .build(),
    );

    await enterpriseGenerator.ensureToken();

    group("Enterprise token", () => {
        check(enterpriseGenerator.getToken(), {
            "got an enterprise token": (token) => token.length > 0,
        });
    });

    const maskinportenGenerator = new MaskinportenAccessTokenGenerator(
        new MaskinportenTokenBuilder().withScopes(scopes).build(),
    );

    await maskinportenGenerator.ensureToken();

    group("Maskinporten token", () => {
        check(maskinportenGenerator.getToken(), {
            "got a maskinporten token": (token) => token.length > 0,
        });
    });
}
