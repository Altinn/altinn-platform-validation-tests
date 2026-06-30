/**
 * This test script is designed to retrieve dialogs for a given end user and then drill down into the details of those dialogs. It performs the following steps:
 * 1. Retrieve all dialogs for a randomly selected end user.
 * 2. For a random dialog, retrieve detailed information including activities, transmissions, and seen logs.
 * 3. For a random activity, transmission, and seen log, retrieve the details of the specific item.
 *
 */

import { DialogSearchParamsBuilder } from "../../../../clients/dialogporten/enduser/index.js";
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
} from "../../../building-blocks/dialogporten/enduser/index.js";
import { getClient, getDialogportenOpts } from "./common-functions.js";

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

export default function (data) {
    const [enduserApiClient, tokenGenerator] = getClient();
    const endUser = getItemFromList(data, randomize);
    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser.ssn));
    const variables = new DialogSearchParamsBuilder()
        .withParties([endUser.ssn])
        .build();
    const res = GetDialogs(
        enduserApiClient,
        variables,
        getDialogslabel,
    );
    drilldown(enduserApiClient, JSON.parse(res));
}

function drilldown(enduserApiClient, dialogs) {
    if (!dialogs.items?.length) {
        console.log("No dialogs found, skipping GetDialog");
        return;
    }
    const dialogId = getItemFromList(dialogs.items, randomize).id;
    GetDialog(
        enduserApiClient,
        dialogId,
        getDialogLabel,
    );

    getActivities(enduserApiClient, dialogId);
    getTransmissions(enduserApiClient, dialogId);
    getSeenLogs(enduserApiClient, dialogId);
    const instanceRef = `urn:altinn:dialog-id:${dialogId}`;
    GetDialogLookup(enduserApiClient, instanceRef, getDialogLookupLabel);
}

function getActivities(enduserApiClient, dialogId) {
    const res = GetDialogActivities(
        enduserApiClient,
        dialogId,
        getDialogActivitiesLabel,
    );
    const activities = JSON.parse(res);
    if (activities.length > 0) {
        GetDialogActivity(
            enduserApiClient,
            dialogId,
            getItemFromList(activities, randomize).id,
            getDialogActivityLabel,
        );
    };
}

function getTransmissions(enduserApiClient, dialogId) {
    const res = GetDialogTransmissions(
        enduserApiClient,
        dialogId,
        getDialogTransmissionsLabel,
    );
    const transmissions = JSON.parse(res);
    if (transmissions.length > 0) {
        GetDialogTransmission(
            enduserApiClient,
            dialogId,
            getItemFromList(transmissions, randomize).id,
            getDialogTransmissionLabel,
        );
    };
}

function getSeenLogs(enduserApiClient, dialogId) {
    const res = GetDialogSeenLogs(
        enduserApiClient,
        dialogId,
        getDialogSeenLogsLabel,
    );
    const seenLogs = JSON.parse(res);
    if (seenLogs.length > 0) {
        GetDialogSeenLog(
            enduserApiClient,
            dialogId,
            getItemFromList(seenLogs, randomize).id,
            getDialogSeenLogLabel,
        );
    };
}
