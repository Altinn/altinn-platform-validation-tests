import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Function to get dialogs
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {string} queryParams - query parameters for the request
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {PaginatedListOfV1ServiceOwnerDialogsQueriesSearch_Dialog|null} Parsed response body, or null when the call failed.
 */
export function GetDialogs(
    serviceOwnerApiClient,
    queryParams,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogs(
        queryParams,
        labels,
    );

    /** @type {PaginatedListOfV1ServiceOwnerDialogsQueriesSearch_Dialog|null} */
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
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1ServiceOwnerDialogsQueriesGet_Dialog|null} Parsed response body, or null when the call failed.
 */
export function GetDialog(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialog(
        dialogId,
        labels,
    );

    /** @type {V1ServiceOwnerDialogsQueriesGet_Dialog|null} */
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

/**
 * Function to get enduser context
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {string} queryParams - query parameters for the request
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {PaginatedListOfV1ServiceOwnerDialogsQueriesSearchEndUserContext_DialogEndUserContextItem|null} Parsed response body, or null when the call failed.
 */
export function GetEndUserContext(
    serviceOwnerApiClient,
    queryParams,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetEndUserContext(
        queryParams,
        labels,
    );

    /** @type {PaginatedListOfV1ServiceOwnerDialogsQueriesSearchEndUserContext_DialogEndUserContextItem|null} */
    let endUserContext = null;

    const success = check(res, {
        "GetEndUserContext - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return endUserContext;
    }

    check(res, {
        "GetEndUserContext - body is valid": (r) => {
            try {
                endUserContext = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return endUserContext;
}
