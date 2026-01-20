import http from "k6/http";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { CreateDialog } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

import { getItemFromList, getOptions, parseCsvData } from "../../../../helpers.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const orgNo = "713431400"; // digdir orgno

const label = "create-dialog";

export const serviceResources = [
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

export const options = getOptions([label]);

let serviceOwnerApiClient = undefined;

export function setup() {
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-dagl-${__ENV.ENVIRONMENT}.csv`);
    return parseCsvData(res.body);
}

/**
 * Function to set up and return clients to interact with the Service Owner Dialog API
 *
 * @returns {Array} An array containing the AuthorizedPartiesClient instance
 */
export function getClients() {
    if (serviceOwnerApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "digdir:dialogporten.serviceprovider");
        tokenOpts.set("org", "test");
        tokenOpts.set("orgNo", orgNo);
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [serviceOwnerApiClient];
}

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    CreateDialog(
        serviceOwnerApiClient,
        getItemFromList(data, randomize).ssn,
        getItemFromList(serviceResources, randomize),
        orgNo,
        label,
    );
}

