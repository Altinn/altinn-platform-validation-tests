import { CreateDialog } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { serviceResources, getClients, orgNo } from "./common-functions.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "false";

const label = { step: "create-dialog-for-organizations" };

export const options = getOptions([label]);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    CreateDialog(
        serviceOwnerApiClient,
        getItemFromList(data, randomize).orgno,
        getItemFromList(serviceResources, randomize),
        orgNo,
        label,
    );
}
