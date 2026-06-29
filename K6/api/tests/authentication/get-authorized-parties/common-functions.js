import { AuthorizedPartiesClient } from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator, EnterpriseTokenGeneratorOptions } from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";
import http from "k6/http";
import { requireEnv } from "../../../../helpers.js";

/**
 * @type {AuthorizedPartiesClient | undefined}
 */
let authorizedPartiesClient = undefined;

/**
 * Creates and caches the client used to interact with the
 * Authorized Parties API.
 *
 * The client uses an enterprise token with the
 * `altinn:accessmanagement/authorizedparties.resourceowner` scope.
 * The same {@link AuthorizedPartiesClient} instance is reused on
 * subsequent calls.
 *
 * @returns {[AuthorizedPartiesClient]} The initialized API client.
 */
export function getClients() {
    if (authorizedPartiesClient == undefined) {
        const tokenOpts = new EnterpriseTokenGeneratorOptions();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.resourceowner");

        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);

        authorizedPartiesClient = new AuthorizedPartiesClient(
            __ENV.BASE_URL,
            tokenGenerator
        );
    }

    return [authorizedPartiesClient];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-dagl-${__ENV.ENVIRONMENT}.csv`,
        { tags: { action: "fetch-test-data" } });
    return parseCsvData(res.body);
}
