import { CreateDialog, CreateTransmission, CreateActivity } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { serviceResources, getClients } from "./create-dialog.js";
export { setup } from "./create-dialog.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const orgNo = "713431400"; // digdir orgno

const create_dialog_label = { action: "create-dialog" };
const create_transmission_label = { action: "create-transmission" };
const create_activity_label = { action: "create-activity" };

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
