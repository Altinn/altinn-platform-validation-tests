
import { AuthorizedPartiesQueryBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties-query.builder.js";
import { AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties-request.builder.js";
import { fetchTestData, getItemFromList, getOptions, requireEnv } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/index.js";
import { getClients } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = { step: "getAuthorizedPartiesForSystemUser" };

export const options = getOptions([label]);

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return fetchTestData(`authentication/systemusers-${__ENV.ENVIRONMENT}.csv`);
}

export default function (data) {
    const [authorizedPartiesClient] = getClients();
    const systemUser = getItemFromList(data, randomize);

    const request = new AuthorizedPartiesRequestBuilder()
        .withSystemUser(systemUser.systemuserUuid)
        .build();

    const queryParams = new AuthorizedPartiesQueryBuilder()
        .includeAltinn2(true)
        .build();

    GetAuthorizedParties(
        authorizedPartiesClient,
        request,
        queryParams,
        label
    );
}
