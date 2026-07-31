import { AuthorizedPartiesQueryBuilder } from "../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties-query.builder.js";
import { AuthorizedPartiesRequestBuilder } from "../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties-request.builder.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetAuthorizedParties } from "../../../building-blocks/access-management/resource-owner/authorized-parties/index.js";
import { getClients } from "./common-functions.js";

export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = { step: "getAuthorizedPartiesForOrg" };

export const options = getOptions([label]);

export default function (data) {
    const [authorizedPartiesClient] = getClients();
    const party = getItemFromList(data, randomize);

    const request = new AuthorizedPartiesRequestBuilder()
        .withOrganization(party.orgno)
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
