import { AuthorizedPartiesQueryBuilder } from "../../../../clients/authorization/authorized-parties-query-builder.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetAuthorizedParties } from "../../../building-blocks/authorization/authorized-parties/index.js";
import { getClients } from "./common-functions.js";

export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = { step: "getAuthorizedPartiesForOrg" };

export const options = getOptions([label]);

export default function (data) {
    const queryParams = new AuthorizedPartiesQueryBuilder()
        .build();

    const [authorizedPartiesClient] = getClients();
    const party = getItemFromList(data, randomize);
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:organization:identifier-no",
        party.orgno,
        queryParams,
        null,
        label
    );
}
