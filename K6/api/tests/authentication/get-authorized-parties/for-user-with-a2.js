
import { GetAuthorizedParties } from "../../../building-blocks/authentication/authorized-parties/index.js";
import { getClients } from "./common-functions.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
export { setup } from "./common-functions.js";

const includeAltinn2 = true;
const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = "getAuthorizedPartiesForUser";

export const options = getOptions([label]);

export default function (data) {
    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(data, randomize);
    const queryParams = {
        includeAltinn2: includeAltinn2
    };
    if (includeAltinn2) {
        queryParams.includeAltinn2 = "true";
    }
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:person:identifier-no",
        userParty.ssn,
        queryParams,
        label
    );
}
