
import { AuthorizedPartiesQueryBuilder } from "../../../../clients/authorization/authorized-parties-query.builder.js";
import { AuthorizedPartiesRequestBuilder } from "../../../../clients/authorization/authorized-parties-request.builder.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetAuthorizedParties } from "../../../building-blocks/authorization/authorized-parties/index.js";
import { getClients } from "./common-functions.js";

export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = { step: "getAuthorizedPartiesForUserIncludePartiesViaKeyRole" };

export const options = getOptions([label]);

export default function (data) {
    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(data, randomize);

    const request = new AuthorizedPartiesRequestBuilder()
        .withPerson(userParty.ssn)
        .build();

    const queryParams = new AuthorizedPartiesQueryBuilder()
        .includeAltinn2(false)
        .includePartiesViaKeyRoles(false)
        .build();

    GetAuthorizedParties(
        authorizedPartiesClient,
        request,
        queryParams,
        label
    );
}
