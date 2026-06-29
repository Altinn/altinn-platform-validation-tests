import http from "k6/http";
import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";
import { PersonalTokenGenerator } from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";
import { requireEnv } from "../../../../helpers.js";

/**
 * @type {EnduserApiClient | undefined}
 */
let enduserApiClient = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * k6 setup function.
 *
 * Fetches end user test data from a CSV file hosted on GitHub and parses it
 * into a usable format for the test.
 *
 * The CSV contains SSNs for the target environment.
 *
 * @returns {Array} Parsed CSV data used as test input.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/dialogporten/endusers/${__ENV.ENVIRONMENT}/endusers.csv`,
        { tags: { action: "fetch-test-data" } },
    );

    return parseCsvData(res.body);
}

/**
 * Creates and caches the GraphQL/Enduser API client and token generator.
 *
 * The same {@link EnduserApiClient} and {@link PersonalTokenGenerator}
 * instances are reused across iterations. The token generator is configured
 * using Dialogporten-specific options for authentication.
 *
 * @returns {[
 *   EnduserApiClient,
 *   PersonalTokenGenerator
 * ]} Tuple containing the API client and token generator.
 */
export function getClient() {
    if (enduserApiClient === undefined) {
        const baseUrl = __ENV.BASE_URL;
        const tokenOpts = getDialogportenOpts();

        tokenGenerator = new PersonalTokenGenerator(tokenOpts);

        enduserApiClient = new EnduserApiClient(baseUrl, tokenGenerator);
    }

    return [enduserApiClient, tokenGenerator];
}

/**
 * Changes the options for the token generator. If an SSN is provided, it will be included in the token options to generate a token specific to that end user.
 * @param {*} ssn
 * @returns
 */
export function getDialogportenOpts(ssn = null) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "digdir:dialogporten");
    if (ssn !== null) {
        tokenOpts.set("pid", ssn);
    }
    return tokenOpts;
}
