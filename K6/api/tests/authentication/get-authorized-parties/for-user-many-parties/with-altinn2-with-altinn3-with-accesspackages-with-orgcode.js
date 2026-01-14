
import { GetAuthorizedParties } from "../../../../building-blocks/authentication/authorized-parties/index.js";
import { AuthorizedPartiesClient } from "../../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { endUsers, endUserLabels } from "./end-users.js";

const randomize = (__ENV.RANDOMIZE ?? "false") === "true";

const orgCodes = [
    //"asf",
    "brg",
    "dfo",
    "digdir",
    //"digitaliseringsdirektoratet",
    "fors",
    //"kmd",
    "mdir",
    "nav",
    "pod",
    "skd",
    "svv",
    "ttd",
]

export const options = getOptions(endUserLabels);
let authorizedPartiesClient = undefined;

/**
 * Function to set up and return clients to interact with the Authorized Parties API
 *
 * @returns {Array} An array containing the AuthorizedPartiesClient instance
 */
function getClients() {
  if (authorizedPartiesClient == undefined) {
      const tokenOpts = new Map();
      tokenOpts.set("env", __ENV.ENVIRONMENT);
      tokenOpts.set("ttl", 3600);
      tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.admin");
      const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
      authorizedPartiesClient = new AuthorizedPartiesClient(__ENV.BASE_URL, tokenGenerator);
  }
  return [authorizedPartiesClient];
}

export default function () {
    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(endUsers, randomize);
    const randomizeOrgCodes = true
    const queryParams = {
        includeAltinn3: "true",
        includeAltinn2: "true",
        includeAccessPackages: "true",
        orgCode: getItemFromList(orgCodes, randomizeOrgCodes),
    };
    
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:person:identifier-no",
        userParty.pid,
        queryParams,
        userParty.label,
    );
}
