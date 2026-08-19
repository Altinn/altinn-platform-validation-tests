
import { AuthorizedPartiesQueryBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties-query.builder.js";
import { AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties-request.builder.js";
import { fetchTestData, getItemFromList, getOptions, requireEnv } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/index.js";
import { getClients } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = { step: "getAuthorizedPartiesForUserDPWithFilter" };

export const options = getOptions([label]);

export default function (data) {

    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(data, randomize);

    const request = new AuthorizedPartiesRequestBuilder()
        .withPerson(userParty.ssn)
        .withPartyFilter(userParty.avgivere.split(" "))
        .build();

    const queryParams = new AuthorizedPartiesQueryBuilder()
        .includeAltinn2(true)
        .includeAltinn3(true)
        .includeRoles(true)
        .includeAccessPackages(true)
        .includeResources(true)
        .includeInstances(true)
        .build();

    GetAuthorizedParties(
        authorizedPartiesClient,
        request,
        queryParams,
        label
    );
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return fetchTestData(`authentication/party-avgivere-${__ENV.ENVIRONMENT}.csv`);
}
