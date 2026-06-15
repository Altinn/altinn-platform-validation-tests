import { check } from "k6";
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Function to get dialogs
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} queryParams - query parameters for the request
 * @param {string} label - label for the request
 * @return response body of the request
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
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog to get
 * @param {string} label - label for the request
 * @return response body of the request
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

    const success = check(res, {
        "GetDialog - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get dialog activities
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog to get activities for
 * @param {string} label - label for the request
 * @return response body of the request
 */
export function GetDialogActivities(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogActivities(
        dialogId,
        labels,
    );

    const success = check(res, {
        "GetDialogActivities - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get a dialog activity by id
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog the activity belongs to
 * param {string} activityId - id of the activity to get
 * @param {string} label - label for the request
 * @return response body of the request
 */
export function GetDialogActivity(
    serviceOwnerApiClient,
    dialogId,
    activityId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogActivity(
        dialogId,
        activityId,
        labels,
    );

    const success = check(res, {
        "GetDialogActivity - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get serviceowner labels
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog to get labels for
 * @param {string} label - label for the request
 * @return response body of the request
 */
export function GetServiceOwnerLabels(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetServiceOwnerLabels(
        dialogId,
        labels,
    );

    const success = check(res, {
        "GetServiceOwnerLabels - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get dialog seen log
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog to get seen log for
 * @param {string} label - label for the request
 * @return response body of the request
 */
export function GetDialogSeenLog(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogSeenLog(
        dialogId,
        labels,
    );

    const success = check(res, {
        "GetDialogSeenLog - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get dialog seen log entry
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog the seen log entry belongs to
 * param {string} seenLogEntryId - id of the seen log entry to get
 * @param {string} label - label for the request
 */
export function GetDialogSeenLogEntry(
    serviceOwnerApiClient,
    dialogId,
    seenLogEntryId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogSeenLogEntry(
        dialogId,
        seenLogEntryId,
        labels,
    );

    const success = check(res, {
        "GetDialogSeenLogEntry - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get dialog tranmissions
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog to get transmissions for
 * @param {string} label - label for the request
 * @return response body of the request
 */
export function GetDialogTransmissions(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogTransmissions(
        dialogId,
        labels,
    );

    const success = check(res, {
        "GetDialogTransmissions - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get a dialog transmission by id
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog the transmission belongs to
 * param {string} transmissionId - id of the transmission to get
 * @param {string} label - label for the request
 * @return response body of the request
 */
export function GetDialogTransmission(
    serviceOwnerApiClient,
    dialogId,
    transmissionId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogTransmission(
        dialogId,
        transmissionId,
        labels,
    );

    const success = check(res, {
        "GetDialogTransmission - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get enduser context
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} queryParams - query parameters for the request
 * @param {string} label - label for the request
 * @return response body of the request
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

    const success = check(res, {
        "GetEndUserContext - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}