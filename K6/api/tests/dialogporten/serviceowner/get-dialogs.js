import { serviceResources, getClients } from "./common-functions.js";

import { getItemFromList, getOptions } from "../../../../helpers.js";
import {
    GetDialogs,
    GetDialog,
    GetDialogActivities,
    GetDialogActivity,
    GetDialogTransmissions,
    GetDialogTransmission
} from "../../../building-blocks/dialogporten/serviceowner/get-dialogs.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "false";

const getDialogslabel = { action: "1. get-dialogs" };
const getDialogLabel = { action: "2. get-dialog" };
const getDialogActivitiesLabel = { action: "3. get-dialog-activities" };
const getDialogActivityLabel = { action: "4. get-dialog-activity" };
const GetDialogTransmissionsLabel = { action: "5. get-dialog-transmissions" };
const GetDialogTransmissionLabel = { action: "6. get-dialog-transmission" };


export const options = getOptions([
    getDialogslabel,
    getDialogLabel,
    getDialogActivitiesLabel,
    getDialogActivityLabel,
    GetDialogTransmissionsLabel,
    GetDialogTransmissionLabel
]);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const ssn = getItemFromList(data, randomize).ssn;
    const resource = getItemFromList(serviceResources, randomize);
    const queryParams = {
        endsuserid: `urn:altinn:person:identifier-no:${ssn}`,
        serviceResources: `urn:altinn:resource:${resource}`
    };
    const res = GetDialogs(
        serviceOwnerApiClient,
        queryParams,
        getDialogslabel,
    );
    drilldown(serviceOwnerApiClient, JSON.parse(res));

}

function drilldown(serviceOwnerApiClient, dialogs) {
    if (dialogs.items.length === 0) {
        console.log("No dialogs found, skipping GetDialog");
        return;
    }
    const dialogId = getItemFromList(dialogs.items, randomize).id;
    GetDialog(
        serviceOwnerApiClient,
        dialogId,
        getDialogLabel,
    );

    getActivities(serviceOwnerApiClient, dialogId);
    getTransmissions(serviceOwnerApiClient, dialogId);
}

function getActivities(serviceOwnerApiClient, dialogId) {
    const res = GetDialogActivities(
        serviceOwnerApiClient,
        dialogId,
        getDialogActivitiesLabel,
    );
    const activities = JSON.parse(res);
    if (activities.length > 0) {
        GetDialogActivity(
            serviceOwnerApiClient,
            dialogId,
            getItemFromList(activities, randomize).id,
            getDialogActivityLabel,
        );
    };
}

function getTransmissions(serviceOwnerApiClient, dialogId) {
    const res = GetDialogTransmissions(
        serviceOwnerApiClient,
        dialogId,
        GetDialogTransmissionsLabel,
    );
    const transmissions = JSON.parse(res);
    if (transmissions.length > 0) {
        GetDialogTransmission(
            serviceOwnerApiClient,
            dialogId,
            getItemFromList(transmissions, randomize).id,
            GetDialogTransmissionLabel,
        );
    };
}

