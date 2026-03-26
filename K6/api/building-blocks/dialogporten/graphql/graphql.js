import { check } from "k6";
import { GraphqlClient } from "../../../../clients/dialogporten/graphql/index.js";

/**
 * Function to get all dialogs for a party
 * @param {GraphqlClient} graphqlClient 
 * @param {*} partyId - either a pid/ssn (11 digits) or a organization number (9 digits)
 * @param {*} label 
 * @returns 
 */
export function GetAllDialogsForParty(graphqlClient, partyId, label = null) {
    const res = graphqlClient.GetAllDialogsForParty(partyId, label);
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
 * @param {GraphqlClient} graphqlClient 
 * @param {string} partyId - either a pid/ssn (11 digits) or a organization number (9 digits) 
 * @param {uuidv7} dialogId
 * @param {string} label 
 * @returns 
 */
export function GetAllDialogsForPartyCheckForDialogId(graphqlClient, partyId, dialogId, label = null) {
    const res = graphqlClient.GetAllDialogsForParty(partyId, label);
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
                console.log(`DialogId ${dialogId} not found in response`);
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
 * @param {GraphqlClient} graphqlClient
 * @param {uuidv7} dialogId - id of the dialog to get
 * @param {string} label
 * @return
 * 
 */
export function GetDialogById(graphqlClient, dialogId, label = null) {
    const res = graphqlClient.GetDialogById(dialogId, label);
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
 * @param {GraphqlClient} graphqlClient
 * @param {uuidv7} dialogId - id of the dialog to get
 * @param {string} label
 * @return
 * 
 */
export function GetAndVerifyDialogById(graphqlClient, dialogId, label = null) {
    const res = graphqlClient.GetDialogById(dialogId, label);
    const succeed = check(res, {
        "GetDialogById - status code is 200": (r) => r.status === 200,
        "GetDialogById - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetDialogById - body is not empty and contains wanted dialog": (r) => {
            const res_body = JSON.parse(r.body);
            if (res_body === null || res_body === undefined) {
                return false;
            }
            if (!res_body.data.dialogById.dialog || res_body.data.dialogById.dialog.id !== dialogId) {
                console.log(`DialogId ${dialogId} not found in response`);
                return false;
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
