import { CreateDialog, CreateTransmission } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { serviceResources, getClients } from "./create-dialog.js";
import { CreateActivity } from "../../../building-blocks/dialogporten/serviceowner/create-dialog.js";
export { setup } from "./create-dialog.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const orgNo = "713431400"; // digdir orgno

const create_dialog_label = "create-dialog";
const create_transmission_label = "create-transmission";
const create_activity_label = "create-activity";

export const options = getOptions([create_dialog_label, create_transmission_label, create_activity_label]);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const dialogId = CreateDialog(
        serviceOwnerApiClient,
        getItemFromList(data, randomize).ssn,
        getItemFromList(serviceResources, randomize),
        orgNo,
        create_dialog_label,
    );
    const transmissionId = CreateTransmission(
        serviceOwnerApiClient,
        JSON.parse(dialogId),
        create_transmission_label,
    );
    const activityId = CreateActivity(
        serviceOwnerApiClient,
        JSON.parse(dialogId),
        create_activity_label,
    );
}

