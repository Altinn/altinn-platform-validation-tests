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
import { AccessManagementEnduserRequestsScope, ConsentScope } from "../../../scopes.js";

const ORG = "ttd";

// Maskinporten takes the requested scopes space-separated in the grant.
const SCOPES = [
    AccessManagementEnduserRequestsScope.WRITE,
    ConsentScope.READ,
    ConsentScope.WRITE,
].join(" ");

// The generators tag their own requests with token_generator, not with the step
// label, so collect the timings under those tags to see how long each one took.
export const options = getOptions([
    { token_generator: EnterpriseTokenGenerator.TAGS.getToken.token_generator },
    { token_generator: PlatformTokenGenerator.TAGS.getToken.token_generator },
    { token_generator: MaskinportenAccessTokenGenerator.TAGS.getToken.token_generator, },
]);

export function setup() {
    if (__ENV.ENVIRONMENT != "tt02") {
        throw new Error("// The Maskinporten generator signs against test.maskinporten.no, so this only works in TT02.");
    }

    requireEnv([
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
        "MASKINPORTEN_KID",
        "MASKINPORTEN_CLIENT_ID",
        "MASKINPORTEN_CLIENT_PEM",
    ]);

}

export default function () {
    group("Platform token", () => {
        const generator = new PlatformTokenGenerator(
            new PlatformTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .build(),
        );

        check(generator.getToken(), {
            "got a platform token": (token) => token.length > 0,
        });
    });

    group("Enterprise token", () => {
        const generator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withOrganization(ORG)
                .withScopes(SCOPES)
                .build(),
        );

        check(generator.getToken(), {
            "got an enterprise token": (token) => token.length > 0,
        });
    });

    group("Maskinporten token", () => {
        const generator = new MaskinportenAccessTokenGenerator(
            new MaskinportenTokenBuilder().withScopes(SCOPES).build(),
        );

        check(generator.getToken(), {
            "got a maskinporten token": (token) => token.length > 0,
        });
    });
}
