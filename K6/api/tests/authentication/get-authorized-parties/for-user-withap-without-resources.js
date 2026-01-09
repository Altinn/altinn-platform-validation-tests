
import { GetAuthorizedParties } from "../../../building-blocks/authentication/authorized-parties/index.js";
import { getClients } from "./common-functions.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
//export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "false") === "true";

const labels = [
  "a_14022216091_80k",
  "b_21070450361_47K", 
  "c_10121251049_30K", 
  "d_11111574113_27K", 
  "e_26091077719_27K", 
];
const endUsers = [
  { pid: "14022216091", label: labels[0] },
  { pid: "21070450361", label: labels[1] },
  { pid: "10121251049", label: labels[2] },
  { pid: "11111574113", label: labels[3] },
  { pid: "26091077719", label: labels[4] },
];

export const options = getOptions(labels);


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
