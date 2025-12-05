import { GetAuthorizedParties } from "../../../building-blocks/auth/authorized-parties/index.js";
import { getClients } from "./common-functions.js";
export { setup } from "./common-functions.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";

const includeAltinn2 = (__ENV.INCLUDE_ALTINN2 ?? "true") === "true";
const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = "getAuthorizedPartiesForOrg";

export const options = getOptions([label]);

export default function (data) {
    const [authorizedPartiesClient] = getClients();
    const party = getItemFromList(data, randomize);
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:organization:identifier-no",
        party.orgNo,
        includeAltinn2,
        label
    );
}
