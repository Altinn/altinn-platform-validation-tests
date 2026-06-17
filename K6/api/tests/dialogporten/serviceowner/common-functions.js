import http from "k6/http";
import { parseCsvData } from "../../../../helpers.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

export const orgNo = __ENV.API_ENVIRONMENT == "yt01" ? "713431400" : "991825827";

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
* Function to set up and return clients to interact with the Service Owner Dialog API
*
* @returns {Array} An array containing the ServiceOwnerApiClient instance
*/
let serviceOwnerApiClient = undefined;
export function getClients() {
    if (serviceOwnerApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "digdir:dialogporten.serviceprovider digdir:dialogporten.serviceprovider.search");
        tokenOpts.set("org", "ttd");
        tokenOpts.set("orgNo", orgNo);
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [serviceOwnerApiClient];
}

/**
 * Setup function to fetch and parse CSV data of end users for testing
 * @returns data parsed from the CSV file containing end user information
 */
export function setup() {
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/dialogporten/endusers/${__ENV.ENVIRONMENT}/endusers.csv`);
    return parseCsvData(res.body);
}

export const sevenDaysAgoIso = () =>
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

export const inOneDayIso = () =>
    new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();

// Noen ord som går igjen i testgenererte dialoger, for å øke sjansen for treff i søkefiltrene
export const texts = ["påkrevd", "rapportering", "sammendrag", "Maks 200 tegn"];
// Noen stedsnavn som ikke er så vanlige, for å øke sjansen for ingen treff i søkefiltrene
export const texts_no_hit = ["sjøvegan", "lavik", "kvalsund", "jøssheim", "sørli"];
