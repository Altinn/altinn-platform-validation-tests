
import http from "k6/http";
import { GetAuthorizedParties } from "../../../building_blocks/auth/authorizedParties/index.js";
import { getClients } from "./commonFunctions.js";
import { getItemFromList, getOptions, parseCsvData } from "../../../../helpers.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = "getAuthorizedPartiesForUserDPWithFilter";

export const options = getOptions([label]);

export default function (data) {
    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(data, randomize);
    const queryParams = {
        includeAltinn2: true,
        includeAltinn3: true,
        includeRoles: true,
        includeAccessPackages: true,
        includeResources: true,
        includeInstances: true
    };

    const parties = userParty.avgivere.split(" ");
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:person:identifier-no",
        userParty.ssn,
        queryParams,
        label,
        parties
    );
}

export function setup() {
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/auth/party-avgivere-${__ENV.ENVIRONMENT}.csv`);
    return parseCsvData(res.body);
}
