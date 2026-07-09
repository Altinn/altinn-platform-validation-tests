import http from "k6/http";

import { AuthorizedPartiesQueryBuilder } from "../../../../clients/authorization/authorized-parties-query-builder.js";
import { getItemFromList, getOptions, parseCsvData } from "../../../../helpers.js";
import { requireEnv } from "../../../../helpers.js";
import { GetAuthorizedParties } from "../../../building-blocks/authorization/authorized-parties/index.js";
import { getClients } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = { step: "getAuthorizedPartiesForSystemUser" };

export const options = getOptions([label]);

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/systemusers-${__ENV.ENVIRONMENT}.csv`,
        { tags: { action: "fetch-test-data" } });
    return parseCsvData(res.body);
}

export default function (data) {
    const queryParams = new AuthorizedPartiesQueryBuilder()
        .includeAltinn2(true)
        .build();

    const [authorizedPartiesClient] = getClients();
    const systemUser = getItemFromList(data, randomize);
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:systemuser:uuid",
        systemUser.systemuserUuid,
        queryParams,
        null,
        label
    );
}
