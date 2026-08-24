import { getItemFromList, getOptions } from "../../../../helpers.js";
import {
    GetDialog,
    GetDialogActivities,
    GetDialogActivity,
    GetDialogLookup,
    GetDialogs,
    GetDialogSeenLog,
    GetDialogSeenLogs,
    GetDialogTransmission,
    GetDialogTransmissions,
} from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getClients, serviceResources } from "./common-functions.js";

export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getDialogslabel = { step: "1. get-dialogs" };
const getDialogLabel = { step: "2. get-dialog" };
const getDialogActivitiesLabel = { step: "3. get-dialog-activities" };
const getDialogActivityLabel = { step: "4. get-dialog-activity" };
const getDialogTransmissionsLabel = { step: "5. get-dialog-transmissions" };
const getDialogTransmissionLabel = { step: "6. get-dialog-transmission" };
const getDialogSeenLogsLabel = { step: "7. get-dialog-seen-logs" };
const getDialogSeenLogLabel = { step: "8. get-dialog-seen-log" };
const getDialogLookupLabel = { step: "9. get-dialog-lookup" };

export const options = getOptions([
    getDialogslabel,
    getDialogLabel,
    getDialogActivitiesLabel,
    getDialogActivityLabel,
    getDialogTransmissionsLabel,
    getDialogTransmissionLabel,
    getDialogSeenLogsLabel,
    getDialogSeenLogLabel,
    getDialogLookupLabel,
]);

/**
 * @param {ReturnType<typeof import("./common-functions.js").setup>} data Test data from setup.
 */
export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const ssn = getItemFromList(data, randomize).ssn;
    const resource = getItemFromList(serviceResources, randomize);
    const queryParams = {
        endUserId: `urn:altinn:person:identifier-no:${ssn}`,
        serviceResource: `urn:altinn:resource:${resource}`
    };
    const res = GetDialogs(
        serviceOwnerApiClient,
        queryParams,
        getDialogslabel,
    );
    drilldown(serviceOwnerApiClient, res);
}

function drilldown(serviceOwnerApiClient, dialogs) {
    if (!dialogs?.items?.length) {
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
    getSeenLogs(serviceOwnerApiClient, dialogId);
    const queryParams = {
        instanceRef: `urn:altinn:dialog-id:${dialogId}`,
    };
    GetDialogLookup(serviceOwnerApiClient, queryParams, getDialogLookupLabel);
}

function getActivities(serviceOwnerApiClient, dialogId) {
    const activities = GetDialogActivities(
        serviceOwnerApiClient,
        dialogId,
        getDialogActivitiesLabel,
    );
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
    const transmissions = GetDialogTransmissions(
        serviceOwnerApiClient,
        dialogId,
        getDialogTransmissionsLabel,
    );
    if (transmissions.length > 0) {
        GetDialogTransmission(
            serviceOwnerApiClient,
            dialogId,
            getItemFromList(transmissions, randomize).id,
            getDialogTransmissionLabel,
        );
    };
}

function getSeenLogs(serviceOwnerApiClient, dialogId) {
    const seenLogs = GetDialogSeenLogs(
        serviceOwnerApiClient,
        dialogId,
        getDialogSeenLogsLabel,
    );
    if (seenLogs.length > 0) {
        GetDialogSeenLog(
            serviceOwnerApiClient,
            dialogId,
            getItemFromList(seenLogs, randomize).id,
            getDialogSeenLogLabel,
        );
    };
}
