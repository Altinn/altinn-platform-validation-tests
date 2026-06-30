import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Function to get dialogs
 * @param {EnduserApiClient} enduserApiClient
 * @param {string} queryParams - query parameters for the request
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @return response body of the request
 */
export function GetDialogs(enduserApiClient, queryParams, labels = null) {
    const res = enduserApiClient.GetDialogs(queryParams, labels);

    const success = check(res, {
        "GetDialogs - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get a dialog by id
 * @param {EnduserApiClient} enduserApiClient
 * @param {string} dialogId - id of the dialog to get
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @return response body of the request
 */
export function GetDialog(enduserApiClient, dialogId, labels = null) {
    const res = enduserApiClient.GetDialog(dialogId, labels);

    const success = check(res, {
        "GetDialog - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}
