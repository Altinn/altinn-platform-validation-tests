/**
 * This test script is designed to retrieve dialogs for a given end user and then drill down into the details of those dialogs. It performs the following steps:
 * 1. Retrieve all dialogs for a randomly selected end user.
 * 2. For a random dialog, retrieve detailed information including activities, transmissions, and seen logs.
 * 3. For a random activity, transmission, and seen log, retrieve the details of the specific item.
 *
 */

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";
import { DialogSearchParamsBuilder } from "../../../../clients/dialogporten/enduser/index.js";
import { PaginatedListOfV1EndUserDialogsQueriesSearch_Dialog } from "../../../../clients/dialogporten/enduser/types.js";
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

/**
 * @param {ReturnType<typeof import("./common-functions.js").setup>} data Test data from setup.
 */
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
    drilldown(enduserApiClient, res);
}

/**
 * Reads one dialog from the search result, then everything hanging off it.
 *
 * @param {EnduserApiClient} enduserApiClient Client for the API.
 * @param {PaginatedListOfV1EndUserDialogsQueriesSearch_Dialog|null} dialogs The search result to pick a dialog from.
 * @returns {void} Nothing. The checks record what the calls returned.
 */
function drilldown(enduserApiClient, dialogs) {
    if (!dialogs?.items?.length) {
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
    GetDialogLookup(enduserApiClient, dialogId, getDialogLookupLabel);
}

/**
 * @param {EnduserApiClient} enduserApiClient Client for the API.
 * @param {string} dialogId The dialog to read the activities of.
 * @returns {void} Nothing. The checks record what the calls returned.
 */
function getActivities(enduserApiClient, dialogId) {
    const activities = GetDialogActivities(
        enduserApiClient,
        dialogId,
        getDialogActivitiesLabel,
    );
    if (activities.length > 0) {
        GetDialogActivity(
            enduserApiClient,
            dialogId,
            getItemFromList(activities, randomize).id,
            getDialogActivityLabel,
        );
    };
}

/**
 * @param {EnduserApiClient} enduserApiClient Client for the API.
 * @param {string} dialogId The dialog to read the transmissions of.
 * @returns {void} Nothing. The checks record what the calls returned.
 */
function getTransmissions(enduserApiClient, dialogId) {
    const transmissions = GetDialogTransmissions(
        enduserApiClient,
        dialogId,
        getDialogTransmissionsLabel,
    );
    if (transmissions.length > 0) {
        GetDialogTransmission(
            enduserApiClient,
            dialogId,
            getItemFromList(transmissions, randomize).id,
            getDialogTransmissionLabel,
        );
    };
}

/**
 * @param {EnduserApiClient} enduserApiClient Client for the API.
 * @param {string} dialogId The dialog to read the seen logs of.
 * @returns {void} Nothing. The checks record what the calls returned.
 */
function getSeenLogs(enduserApiClient, dialogId) {
    const seenLogs = GetDialogSeenLogs(
        enduserApiClient,
        dialogId,
        getDialogSeenLogsLabel,
    );
    if (seenLogs.length > 0) {
        GetDialogSeenLog(
            enduserApiClient,
            dialogId,
            getItemFromList(seenLogs, randomize).id,
            getDialogSeenLogLabel,
        );
    };
}
