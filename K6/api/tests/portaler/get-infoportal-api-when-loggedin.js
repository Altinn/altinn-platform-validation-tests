/**
 * @description This test simulates users accessing the InfoPortal API when logged in. It retrieves authorized parties, favorites, and current information for each user.
 * The test is designed to run with multiple virtual users (VUs) and can randomize user selection from a provided CSV file.
 * The test includes setup to segment user data for VUs, and uses a personal token generator to authenticate API requests.
 * The test checks the responses for correct status codes and logs any failures for further analysis.
 *
 * To run the test, the following environment variables must be set:
 * - TOKEN_GENERATOR_USERNAME: Username for the token generator.
 * - TOKEN_GENERATOR_PASSWORD: Password for the token generator.
 * - `ENVIRONMENT`: The environment to run the test against (e.g., "at23", "tt02, "yt01").
 * - `INFO_CLOUD_URL`: The base URL for the InfoPortal API (e.g., "https://info.at23.altinn.cloud").
 * Optional environment variables:
 * - `RANDOMIZE`: Whether to randomize user selection from the CSV file. Defaults to "true".
 *
 * Cli command example:
 * ```bash
 * k6 run --vus 10 --duration 1m get-infoportal-api-when-logged-in.js
 *
 * * @see https://k6.io/docs/ for more information on k6 testing.
 */

import http from "k6/http";
import exec from "k6/execution";
import { GetAuthorizedParties, GetCurrent, GetFavorites } from "../../building-blocks/infoportal/index.js";
import { InfoPortalApiClient } from "../../../clients/infoportal/index.js";
import { PersonalTokenGenerator } from "../../../common-imports.js";
import { parseCsvData, segmentData, getNumberOfVUs, getItemFromList, getOptions } from "../../../helpers.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const authorizedPartiesLabel = { step: "authorizedParties" };
const favoritesLabel = { step: "favorites" };
const currentLabel = { step: "current" };

export const options = getOptions([
    authorizedPartiesLabel,
    favoritesLabel,
    currentLabel,
]);

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
    const numberOfVUs = getNumberOfVUs();
    // Using the same CSV as one of the delegation tests, since we only do reads in this test, it should be safe to use the same users.
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/portaler/${__ENV.ENVIRONMENT}/userids.csv`);
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

/**
 * Main test function that runs for each VU, will run for each iteration. Calls the tree info portal api endpoints, same as a logged in user would do via the browser.
 */
export default function (data) {
    const user = getItemFromList(data[exec.vu.idInTest - 1], randomize);
    const userId = user.userId;
    const [infoPortalApiClient, tokenGenerator] = getClients();
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(userId));
    GetAuthorizedParties(infoPortalApiClient, authorizedPartiesLabel);
    GetFavorites(infoPortalApiClient, favoritesLabel);
    GetCurrent(infoPortalApiClient, currentLabel);
}

// Using global variables to store clients so they are not re-created for each iteration, but only once per VU.
let infoPortalApiClient = undefined;
let personalTokenGenerator = undefined;

/**
 * Internal function to get clients, creates them if they don't exist. This is done to avoid creating new clients for each iteration, which would be inefficient.
 * @returns Array containing the infoPortalApiClient and personalTokenGenerator
 */
function getClients() {
    if (infoPortalApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
        personalTokenGenerator = new PersonalTokenGenerator(tokenOpts);
        infoPortalApiClient = new InfoPortalApiClient(__ENV.INFO_CLOUD_URL, personalTokenGenerator);
    }
    return [infoPortalApiClient, personalTokenGenerator];
}

/**
 * Internal function to get token options for the personal token generator, takes the userId as a parameter to set the correct user for the token.
 * @param {string} userId - The userId to set in the token options
 * @return Map containing the token options
 */
function getTokenOpts(userId) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "digdir:dialogporten.noconsent openid altinn:portal/enduser altinn:instances.read");
    tokenOpts.set("userId", userId);
    return tokenOpts;
}
