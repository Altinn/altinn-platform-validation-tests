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

import exec from "k6/execution";

import { InfoPortalApiClient } from "../../../clients/infoportal/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../common-imports.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, getOptions, lazy, segmentData } from "../../../helpers.js";
import { requireEnv } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString, DigDirScopes } from "../../../scopes.js";
import { GetAuthorizedParties, GetCurrent, GetFavorites } from "../../building-blocks/infoportal/index.js";
import { getInfoCloud } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const rootLabel = { step: "get infocloud root" };
const authorizedPartiesLabel = { step: "authorizedParties" };
const favoritesLabel = { step: "favorites" };
const currentLabel = { step: "current" };

export const options = getOptions([
    rootLabel,
    authorizedPartiesLabel,
    favoritesLabel,
    currentLabel,
]);

/**
 * Setup function to segment data for VUs.
 *
 * @returns TODO: description
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "INFO_CLOUD_URL"]);
    const numberOfVUs = getNumberOfVUs();
    // Using the same CSV as one of the delegation tests, since we only do reads in this test, it should be safe to use the same users.
    const data = fetchTestData(`portaler/${__ENV.ENVIRONMENT}/userids.csv`);
    const segmentedData = segmentData(data, numberOfVUs);
    return segmentedData;
}

/**
 * Main test function that runs for each VU, will run for each iteration. Calls the tree info portal api endpoints, same as a logged in user would do via the browser.
 *
 * @param {ReturnType<typeof setup>} data Users segmented per VU by setup.
 */
export default function (data) {
    const user = getItemFromList(data[exec.vu.idInTest - 1], randomize);
    const userId = user.userId;
    const [infoPortalApiClient, tokenGenerator] = getClients();
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(userId));
    getInfoCloud("/", rootLabel);
    GetAuthorizedParties(infoPortalApiClient, authorizedPartiesLabel);
    GetFavorites(infoPortalApiClient, favoritesLabel);
    GetCurrent(infoPortalApiClient, currentLabel);
}

/**
 * Creates and caches the clients used by the Info Portal tests.
 *
 * Clients are initialized once per VU to avoid unnecessary re-creation
 * on each iteration. The same {@link InfoPortalApiClient} and
 * {@link PersonalTokenGenerator} instances are reused throughout the test.
 *
 * @returns {[
 * InfoPortalApiClient,
 * PersonalTokenGenerator
 * ]} Tuple containing the Info Portal API client and token generator.
 */
const getClients = lazy(function () {
    const scopes = CreateScopeString([
        AltinnScopes.PDP.AUTHORIZE.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .build();

    const personalTokenGenerator = new PersonalTokenGenerator(tokenOpts);

    /** @type {[InfoPortalApiClient, PersonalTokenGenerator]} */
    const clients = [
        new InfoPortalApiClient(__ENV.INFO_CLOUD_URL, personalTokenGenerator),
        personalTokenGenerator,
    ];

    return clients;
});

/**
 * Internal function to get token options for the personal token generator, takes the userId as a parameter to set the correct user for the token.
 *
 * @param {string} userId - The userId to set in the token options
 * @returns Map containing the token options
 */
function getTokenOpts(userId) {
    const scopes = CreateScopeString([
        DigDirScopes.DIALOGPORTEN.NOCONSENT,
        "openid", // TODO: what is this supposed to be???
        AltinnScopes.PORTAL.ENDUSER,
        AltinnScopes.INSTANCES.READ

    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .withUserId(userId)
        .build();
    return tokenOpts;
}
