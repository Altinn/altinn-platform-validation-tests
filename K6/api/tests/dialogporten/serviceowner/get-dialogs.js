import http from "k6/http";
import { serviceResources, getClients } from "./common-functions.js";

import { getItemFromList, getOptions, parseCsvData } from "../../../../helpers.js";
import { GetDialogs } from "../../../building-blocks/dialogporten/serviceowner/get-dialogs.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "false";

const label = { action: "get-dialogs" };


export const options = getOptions([label]);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const ssn = getItemFromList(data, randomize).ssn;
    const resource = getItemFromList(serviceResources, randomize);
    const queryParams = {
        endsuserid: `urn:altinn:person:identifier-no:${ssn}`,
        serviceResources: `urn:altinn:resource:${resource}`
    };
    GetDialogs(
        serviceOwnerApiClient,
        queryParams,
        label,
    );
}
