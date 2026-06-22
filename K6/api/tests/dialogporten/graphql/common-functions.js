import http from "k6/http";
import { GraphqlClient } from "../../../../clients/dialogporten/graphql/index.js";
import { PersonalTokenGenerator } from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";
import { GetParties } from "../../../building-blocks/dialogporten/graphql/index.js";

let graphqlClient = undefined;
let tokenGenerator = undefined;

/**
 * @description The setup function fetches the end user data from a CSV file hosted on GitHub. 
 * The CSV file is expected to contain the social security numbers (SSNs) of the end users for the specified environment. 
 * The function uses an HTTP GET request to retrieve the CSV data and then parses it into a usable format for the tests.
 */
export function setup() {
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/dialogporten/endusers/${__ENV.ENVIRONMENT}/endusers.csv`);
    return parseCsvData(res.body);
}

/**
 * @description This function initializes and returns the GraphQL client and token generator for Dialogporten.
 * @returns an array containing the GraphQL client and the token generator. The function checks if the GraphQL client is already initialized; if not, 
 * it creates a new instance using the base URL from the environment variables and the token generator options. 
 * The token generator is set up to generate personal tokens for authentication with Dialogporten.
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

/**
 * Function to retrieve the parties associated with an end user. It uses the GetParties GraphQL query to fetch the parties and their details.
 * The function processes the response to extract the party URIs for the organizations linked to the end user, including sub-parties.
 * The number of parties returned can be limited by the max_number_of_parties parameter, which defaults to 100 if not specified.
 * @param {*} graphqlClient 
 * @param {*} label 
 * @param {*} max_number_of_parties 
 * @returns 
 */
export function getParties(graphqlClient, label, max_number_of_parties = 100) {
    const resp = GetParties(
        graphqlClient,
        label,
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
 * @param {*} party
 * @return {boolean} true if the party is an organization party, false otherwise
 */
function isOrganizationParty(party) {
    return !party.isDeleted &&
        party.party?.includes("organization");
}
