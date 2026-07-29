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
    //AUTHORIZE_SCOPE,
    ConsentScope.READ,
    ConsentScope.WRITE,
].join(" ");

const label = { step: "token-generators" };

// The generators tag their own requests with token_generator, not with the step
// label, so collect the timings under those tags to see how long each one took.
export const options = getOptions([
    label,
    { token_generator: EnterpriseTokenGenerator.TAGS.getToken.token_generator },
    { token_generator: PlatformTokenGenerator.TAGS.getToken.token_generator },
    {
        token_generator:
            MaskinportenAccessTokenGenerator.TAGS.getToken.token_generator,
    },
]);

export function setup() {
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
            new PlatformTokenBuilder().withEnvironment(ENVIRONMENT).build(),
        );

        check(generator.getToken(), {
            "got a platform token": (token) => token.length > 0,
        });
    });

    group("Enterprise token", () => {
        const generator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(ENVIRONMENT)
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

// Add report to the summary so we can see how long each generator took to get a token.
export { handleSummary } from "../../../common-imports.js";
