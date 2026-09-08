import { check } from "k6";

import { DialogSearchParams } from "../../../../clients/dialogporten/enduser/dialogs-search-params-builder.js";
import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";
import { PaginatedListOfV1EndUserDialogsQueriesSearch_Dialog, V1EndUserDialogsQueriesGet_Dialog } from "../../../../clients/dialogporten/enduser/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Function to get dialogs
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {DialogSearchParams} queryParams - query parameters for the request
 * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
 * @returns {PaginatedListOfV1EndUserDialogsQueriesSearch_Dialog|null} Parsed response body, or null when the call failed.
 */
export function GetDialogs(enduserApiClient, queryParams, labels = null) {
    const res = withRetries(
        () => enduserApiClient.GetDialogs(queryParams, labels),
        "GetDialogs",
    );

    /** @type {PaginatedListOfV1EndUserDialogsQueriesSearch_Dialog|null} */
    let dialogs = null;

    const success = check(res, {
        "GetDialogs - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dialogs;
    }

    check(res, {
        "GetDialogs - body is valid": (r) => {
            try {
                dialogs = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dialogs;
}

/**
 * Function to get a dialog by id
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get
 * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
 * @returns {V1EndUserDialogsQueriesGet_Dialog|null} Parsed response body, or null when the call failed.
 */
export function GetDialog(enduserApiClient, dialogId, labels = null) {
    const res = withRetries(
        () => enduserApiClient.GetDialog(dialogId, labels),
        "GetDialog",
    );

    /** @type {V1EndUserDialogsQueriesGet_Dialog|null} */
    let dialog = null;

    const success = check(res, {
        "GetDialog - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dialog;
    }

    check(res, {
        "GetDialog - body is valid": (r) => {
            try {
                dialog = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dialog;
}
