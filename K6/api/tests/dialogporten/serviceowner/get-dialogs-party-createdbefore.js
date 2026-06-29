import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetDialogs } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getClients, inOneDayIso } from "./common-functions.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getDialogslabel = { step: "1. get-dialogs-for-party-createdbefore" };

export const options = getOptions([
    getDialogslabel,
]);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const party = getItemFromList(data, randomize).orgno;
    const queryParams = {
        party: `urn:altinn:organization:identifier-no:${party}`,
        createdBefore: inOneDayIso(),
    };
    GetDialogs(
        serviceOwnerApiClient,
        queryParams,
        getDialogslabel,
    );
}
