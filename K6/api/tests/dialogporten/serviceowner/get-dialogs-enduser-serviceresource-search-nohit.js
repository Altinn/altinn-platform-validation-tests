import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetDialogs } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getClients, serviceResources, texts_no_hit } from "./common-functions.js";

export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getDialogslabel = { step: "1. get-dialogs-enduser-serviceresource-search-nohit" };

export const options = getOptions([
    getDialogslabel,
]);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const ssn = getItemFromList(data, randomize).ssn;
    const resource = getItemFromList(serviceResources, randomize);
    const queryParams = {
        endUserId: `urn:altinn:person:identifier-no:${ssn}`,
        serviceResource: `urn:altinn:resource:${resource}`,
        Search: getItemFromList(texts_no_hit, true),
    };
    GetDialogs(
        serviceOwnerApiClient,
        queryParams,
        getDialogslabel,
    );
}
