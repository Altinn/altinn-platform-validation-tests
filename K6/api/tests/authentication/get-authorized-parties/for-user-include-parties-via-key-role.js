
import { GetAuthorizedParties } from "../../../building-blocks/authentication/authorized-parties/index.js";
import { getClients } from "./common-functions.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
export { setup } from "./common-functions.js";

const includeAltinn2 = false;
const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = "getAuthorizedPartiesForUserIncludePartiesViaKeyRole";

export const options = getOptions([label]);

export default function (data) {
    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(data, randomize);
    const queryParams = {
        includeAltinn2: includeAltinn2,
        includePartiesViaKeyRoles: false
    };
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:person:identifier-no",
        userParty.ssn,
        queryParams,
        label
    );
}
