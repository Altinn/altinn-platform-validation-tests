import { getItemFromList, getOptions } from "../../../../helpers.js";
import { CreateDialog } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getClients, orgNo, serviceResources } from "./common-functions.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "false";

const label = { step: "create-dialog-for-enduser" };

export const options = getOptions([label]);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    CreateDialog(
        serviceOwnerApiClient,
        getItemFromList(data, randomize).ssn,
        getItemFromList(serviceResources, randomize),
        orgNo,
        label,
    );
}
