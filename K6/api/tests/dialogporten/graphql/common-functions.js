import http from "k6/http";

import { GraphqlClient } from "../../../../clients/dialogporten/graphql/index.js";
import { PersonalTokenGenerator, PersonalTokenGeneratorOptions } from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";
import { requireEnv } from "../../../../helpers.js";
import { GetParties } from "../../../building-blocks/dialogporten/graphql/index.js";

/**
 * @type {GraphqlClient | undefined}
 */
let graphqlClient = undefined;

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
        { tags: { action: "fetch-test-data" } }
    );

    return parseCsvData(res.body);
}

/**
 * Creates and caches the GraphQL client and token generator.
 *
 * The same {@link GraphqlClient} and {@link PersonalTokenGenerator}
 * instances are reused across iterations. The token generator is configured
 * using Dialogporten-specific options for authentication.
 *
 * @returns {[
 * GraphqlClient,
 * PersonalTokenGenerator
 * ]} Tuple containing the GraphQL client and token generator.
 */
export function getClient() {
    if (graphqlClient === undefined) {
        const baseUrl = __ENV.BASE_URL;
        const tokenOpts = getDialogportenOpts();

        tokenGenerator = new PersonalTokenGenerator(tokenOpts);

        graphqlClient = new GraphqlClient(baseUrl, tokenGenerator);
    }

    return [graphqlClient, tokenGenerator];
}

/**
 * Changes the options for the token generator. If an SSN is provided, it will be included in the token options to generate a token specific to that end user.
 *
 * @param {*} ssn TODO: description
 * @returns TODO: description
 */
export function getDialogportenOpts(ssn = null) {
    const tokenOpts = new PersonalTokenGeneratorOptions();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "digdir:dialogporten");
    if (ssn !== null) {
        tokenOpts.set("pid", ssn);
    }
    return tokenOpts;
}

/**
 * Function to retrieve the parties associated with an end user. It uses the GetParties GraphQL query to fetch the parties and their details.
 * The function processes the response to extract the party URIs for the organizations linked to the end user, including sub-parties.
 * The number of parties returned can be limited by the max_number_of_parties parameter, which defaults to 100 if not specified.
 *
 * @param {*} graphqlClient TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @param {*} max_number_of_parties TODO: description
 * @returns TODO: description
 */
export function getParties(graphqlClient, labels, max_number_of_parties = 100) {
    const resp = GetParties(
        graphqlClient,
        labels,
    );

    const parties = JSON.parse(resp).data?.parties ?? [];
    const result = [];

    for (const party of parties) {
        if (result.length >= max_number_of_parties) {
            break;
        }

        if (isOrganizationParty(party)) {
            result.push(party.party);
        }

        for (const subParty of party.subParties ?? []) {
            if (result.length >= max_number_of_parties) {
                break;
            }
            if (isOrganizationParty(subParty)) {
                result.push(subParty.party);
            }
        }
    }
    return result;
}

/**
 * Helper function to determine if a party is an organization party. It checks if the party is not deleted and if its type includes 'organization'.
 *
 * @param {*} party TODO: description
 * @returns {boolean} true if the party is an organization party, false otherwise
 */
function isOrganizationParty(party) {
    return !party.isDeleted &&
        party.party?.includes("organization");
}
