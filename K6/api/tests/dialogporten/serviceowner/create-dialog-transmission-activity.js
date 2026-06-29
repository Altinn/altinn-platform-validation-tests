import { CreateDialog, CreateTransmission, CreateActivity } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { serviceResources, getClients, orgNo } from "./common-functions.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const create_dialog_label = { step: "create-dialog" };
const create_transmission_label = { step: "create-transmission" };
const create_activity_label = { step: "create-activity" };

export const options = getOptions([create_dialog_label, create_transmission_label, create_activity_label]);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const noTransmissionsActivities = true;
    const dialogId = CreateDialog(
        serviceOwnerApiClient,
        getItemFromList(data, randomize).ssn,
        getItemFromList(serviceResources, randomize),
        orgNo,
        create_dialog_label,
        noTransmissionsActivities,
    );
    CreateTransmission(
        serviceOwnerApiClient,
        JSON.parse(dialogId),
        create_transmission_label,
    );
    CreateActivity(
        serviceOwnerApiClient,
        JSON.parse(dialogId),
        create_activity_label,
    );
}
