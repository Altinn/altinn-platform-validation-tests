import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetEndUserContext } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getClients } from "./common-functions.js";

export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getDialogslabel = { step: "1. get-endusercontext" };

export const options = getOptions([
    getDialogslabel,
]);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const party = getItemFromList(data, randomize).ssn;
    const queryParams = {
        party: `urn:altinn:person:identifier-no:${party}`,
    };
    GetEndUserContext(
        serviceOwnerApiClient,
        queryParams,
        getDialogslabel,
    );
}
