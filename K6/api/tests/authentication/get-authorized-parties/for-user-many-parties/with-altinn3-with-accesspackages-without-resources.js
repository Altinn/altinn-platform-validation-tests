
import { GetAuthorizedParties } from "../../../../building-blocks/authentication/authorized-parties/index.js";
import { getClients } from "../common-functions.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { endUsers, endUserLabels } from "./end-users.js";

const randomize = (__ENV.RANDOMIZE ?? "false") === "true";

export const options = getOptions(endUserLabels);

export default function () {
    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(endUsers, randomize);
    const queryParams = {
        includeAltinn3: "true",
        includeAccessPackages: "true",
        includeResources: "false" 
    };
    
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:person:identifier-no",
        userParty.pid,
        queryParams,
        userParty.label,
    );
}
