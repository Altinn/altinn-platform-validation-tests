import http from "k6/http";
import { getItemFromList, getOptions, parseCsvData } from "../../../../helpers.js";
import { GetAuthorizedParties } from "../../../building-blocks/authentication/authorized-parties/index.js";
import { getClients } from "./common-functions.js";

const includeAltinn2 = true;
const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = "getAuthorizedPartiesForSystemUser";

export const options = getOptions([label]);

export function setup() {
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/systemusers-${__ENV.ENVIRONMENT}.csv`);
    return parseCsvData(res.body);
}

export default function (data) {
    const [authorizedPartiesClient] = getClients();
    const systemUser = getItemFromList(data, randomize);
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:systemuser:uuid",
        systemUser.systemuserUuid,
        includeAltinn2,
        label
    );
}
