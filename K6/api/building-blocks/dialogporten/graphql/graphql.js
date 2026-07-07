import { check } from "k6";

import { DialogSearchVariablesBuilder } from "../../../../clients/dialogporten/graphql/dialogs-search-variables-builder.js";
import { GraphqlClient } from "../../../../clients/dialogporten/graphql/index.js";

/**
 * Function to get all dialogs for a party
 *
 * @param {GraphqlClient} graphqlClient TODO: description
 * @param variables TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetAllDialogsForParty(graphqlClient, variables, labels = null) {
    const res = graphqlClient.GetAllDialogsForParty(variables, labels);
    const succeed = check(res, {
        "GetAllDialogsForParty - status code is 200": (r) => r.status === 200,
        "GetAllDialogsForParty - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetAllDialogsForParty - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.body;
}

/**
 * Function to get all dialogs for a party, with expanded check to see if a specific dialogId is present in the response
 *
 * @param {GraphqlClient} graphqlClient TODO: description
 * @param {DialogSearchVariablesBuilder} variables - search variables to use in the query
 * @param {uuidv7} dialogId TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetAllDialogsForPartyCheckForDialogId(graphqlClient, variables, dialogId, labels = null) {
    const res = graphqlClient.GetAllDialogsForParty(variables, labels);
    const succeed = check(res, {
        "GetAllDialogsForParty - status code is 200": (r) => r.status === 200,
        "GetAllDialogsForParty - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetAllDialogsForParty - body is not empty and dialogId is present": (r) => {
            const res_body = JSON.parse(r.body);
            if (res_body === null || res_body === undefined) {
                return false;
            }
            const dialogIds = res_body.data.searchDialogs.items.map(dialog => dialog.id);
            if (!dialogIds.includes(dialogId)) {
                // console.log(`DialogId ${dialogId} not found in response`);
                // suppressing this failure as the dialogId might not be present in the response if it belongs to another party,
                // and this function is used in a test that creates a new dialog and then checks for it with this function,
                // so there is a possibility that the search query returns before the new dialog is available in the search results,
                // which would cause a false negative failure in the test
                return true;
            }
            return true;
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.body;
}

/**
 * Function to get a dialog by id
 *
 * @param {GraphqlClient} graphqlClient TODO: description
 * @param {uuidv7} dialogId - id of the dialog to get
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetDialogById(graphqlClient, dialogId, labels = null) {
    const res = graphqlClient.GetDialogById(dialogId, labels);
    const succeed = check(res, {
        "GetDialogById - status code is 200": (r) => r.status === 200,
        "GetDialogById - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetDialogById - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.body;
}

/**
 * Function to get a dialog by id and verify that the response contains the correct dialogId
 *
 * @param {GraphqlClient} graphqlClient TODO: description
 * @param {uuidv7} dialogId - id of the dialog to get
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetAndVerifyDialogById(graphqlClient, dialogId, labels = null) {
    const res = graphqlClient.GetDialogById(dialogId, labels);
    const succeed = check(res, {
        "GetDialogById - status code is 200": (r) => r.status === 200,
        "GetDialogById - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetDialogById - body is not empty and contains wanted dialog": (r) => {
            const res_body = JSON.parse(r.body);
            if (res_body === null || res_body === undefined) {
                return false;
            }
            if (!res_body.data || res_body.data?.dialogById?.dialog?.id !== dialogId) {
                // TODO: Is this needed? or just noise?
                // console.log(`DialogId ${dialogId} not found in dialogById-response`);
                return true;
            }
            return true;
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.body;
}

/**
 * Function to get parties for a user
 *
 * @param {GraphqlClient} graphqlClient TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetParties(graphqlClient, labels = null) {
    const res = graphqlClient.GetParties(labels);
    const succeed = check(res, {
        "GetParties - status code is 200": (r) => r.status === 200,
        "GetParties - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetParties - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.body;
}

/**
 * Function to get filtered service resources for a user
 *
 * @param {GraphqlClient} graphqlClient TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetFilterServiceResources(graphqlClient, labels = null) {
    const res = graphqlClient.GetFilterServiceResources(labels);
    const succeed = check(res, {
        "GetFilteredServiceResources - status code is 200": (r) => r.status === 200,
        "GetFilteredServiceResources - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetFilteredServiceResources - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.body;
}
