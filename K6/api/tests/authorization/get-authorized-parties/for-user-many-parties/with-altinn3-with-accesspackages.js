
import { AuthorizedPartiesQueryBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties-query.builder.js";
import { AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties-request.builder.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/index.js";
import { getClients } from "../common-functions.js";
import { endUserLabels, endUsers } from "./end-users.js";

const randomize = (__ENV.RANDOMIZE ?? "false") === "true";

export const options = getOptions(endUserLabels);

export default function () {
    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(endUsers, randomize);

    const request = new AuthorizedPartiesRequestBuilder()
        .withPerson(userParty.pid)
        .build();

    const queryParams = new AuthorizedPartiesQueryBuilder()
        .includeAltinn3(true)
        .includeAccessPackages(true)
        .build();

    GetAuthorizedParties(
        authorizedPartiesClient,
        request,
        queryParams,
        { unique_id: userParty.label },
    );
}
