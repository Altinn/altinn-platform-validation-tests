
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { fetchTestData } from "../../../../helpers.js";
import { requireEnv } from "../../../../helpers.js";

export const orgNo = __ENV.ENVIRONMENT == "yt01" ? "713431400" : "991825827";

const performanceResources = [
    "ttd-dialogporten-performance-test-01",
    "ttd-dialogporten-performance-test-02",
    "ttd-dialogporten-performance-test-03",
    "ttd-dialogporten-performance-test-04",
    "ttd-dialogporten-performance-test-05",
    "ttd-dialogporten-performance-test-06",
    "ttd-dialogporten-performance-test-07",
    "ttd-dialogporten-performance-test-08",
    "ttd-dialogporten-performance-test-09",
    "ttd-dialogporten-performance-test-10",
];

export const serviceResources =
    __ENV.ENVIRONMENT === "yt01"
        ? performanceResources
        : ["k6-instancedelegation-test"];

/**
 * @type {ServiceOwnerApiClient | undefined}
 */
let serviceOwnerApiClient = undefined;

/**
 * Creates and caches the client used to interact with the
 * Service Owner Dialog API.
 *
 * The client uses an enterprise token with the following scopes:
 * - `digdir:dialogporten.serviceprovider`
 * - `digdir:dialogporten.serviceprovider.search`
 *
 * The same {@link ServiceOwnerApiClient} instance is reused across iterations.
 *
 * @returns {[ServiceOwnerApiClient]} Tuple containing the Service Owner API client.
 */
export function getClients() {
    if (serviceOwnerApiClient === undefined) {
        const tokenOpts = new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes("digdir:dialogporten.serviceprovider digdir:dialogporten.serviceprovider.search")
            .withOrganization("ttd")
            .withOrganizationNumber(orgNo)
            .build();

        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);

        serviceOwnerApiClient = new ServiceOwnerApiClient(
            __ENV.BASE_URL,
            tokenGenerator
        );
    }

    return [serviceOwnerApiClient];
}

/**
 * Setup function to fetch and parse CSV data of end users for testing
 *
 * @returns data parsed from the CSV file containing end user information
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return fetchTestData(`dialogporten/endusers/${__ENV.ENVIRONMENT}/endusers.csv`);
}

export const sevenDaysAgoIso = () =>
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

export const inOneDayIso = () =>
    new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();

// Noen ord som går igjen i testgenererte dialoger, for å øke sjansen for treff i søkefiltrene
export const texts = ["påkrevd", "rapportering", "sammendrag", "Maks 200 tegn"];
// Noen stedsnavn som ikke er så vanlige, for å øke sjansen for ingen treff i søkefiltrene
export const texts_no_hit = ["sjøvegan", "lavik", "kvalsund", "jøssheim", "sørli"];
