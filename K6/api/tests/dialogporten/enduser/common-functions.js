
import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
import { fetchTestData, lazy } from "../../../../helpers.js";
import { requireEnv } from "../../../../helpers.js";

/**
 * k6 setup function.
 *
 * Fetches end user test data from a CSV file hosted on GitHub and parses it
 * into a usable format for the test.
 *
 * The CSV contains SSNs for the target environment.
 *
 * @returns {any[]} Parsed CSV data used as test input.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return fetchTestData(`dialogporten/endusers/${__ENV.ENVIRONMENT}/endusers.csv`);
}

/**
 * Creates and caches the GraphQL/Enduser API client and token generator.
 *
 * The same {@link EnduserApiClient} and {@link PersonalTokenGenerator}
 * instances are reused across iterations. The token generator is configured
 * using Dialogporten-specific options for authentication.
 *
 * @returns {[
 * EnduserApiClient,
 * PersonalTokenGenerator
 * ]} Tuple containing the API client and token generator.
 */
export const getClient = lazy(function () {
    const tokenGenerator = new PersonalTokenGenerator(getDialogportenOpts());

    /** @type {[EnduserApiClient, PersonalTokenGenerator]} */
    const clients = [
        new EnduserApiClient(__ENV.BASE_URL, tokenGenerator),
        tokenGenerator,
    ];

    return clients;
});

/**
 * Changes the options for the token generator. If an SSN is provided, it will be included in the token options to generate a token specific to that end user.
 *
 * @param {*} ssn TODO: description
 * @returns TODO: description
 */
export function getDialogportenOpts(ssn = null) {
    const tokenOpts = new PersonalTokenBuilder()
        .withScopes("digdir:dialogporten");

    if (ssn !== null) {
        tokenOpts.withPid(ssn);

    }
    return tokenOpts.build();
}
