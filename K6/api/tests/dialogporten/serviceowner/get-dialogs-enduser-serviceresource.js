import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetDialogs } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getClients, serviceResources } from "./common-functions.js";

export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getDialogslabel = { step: "1. get-dialogs-enduser-serviceresource" };

export const options = getOptions([
    getDialogslabel,
]);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const ssn = getItemFromList(data, randomize).ssn;
    const resource = getItemFromList(serviceResources, randomize);
    const queryParams = {
        endUserId: `urn:altinn:person:identifier-no:${ssn}`,
        serviceResource: `urn:altinn:resource:${resource}`
    };
    GetDialogs(
        serviceOwnerApiClient,
        queryParams,
        getDialogslabel,
    );
}
