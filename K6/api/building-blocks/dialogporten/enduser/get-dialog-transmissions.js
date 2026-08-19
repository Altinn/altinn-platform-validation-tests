import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Function to get dialog tranmissions
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get transmissions for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1EndUserDialogsQueriesSearchTransmissions_Transmission[]} Parsed response body, or an empty array when the call failed.
 */
export function GetDialogTransmissions(
    enduserApiClient,
    dialogId,
    labels = null,
) {
    const res = withRetries(
        () => enduserApiClient.GetDialogTransmissions(
            dialogId,
            labels,
        ),
        "GetDialogTransmissions",
    );

    /** @type {V1EndUserDialogsQueriesSearchTransmissions_Transmission[]} */
    let transmissions = [];

    const success = check(res, {
        "GetDialogTransmissions - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return transmissions;
    }

    check(res, {
        "GetDialogTransmissions - body is valid": (r) => {
            try {
                transmissions = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return transmissions;
}

/**
 * Function to get a dialog transmission by id
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog the transmission belongs to
 * param {string} transmissionId - id of the transmission to get
 * @param transmissionId TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1EndUserDialogsQueriesGetTransmission_Transmission|null} Parsed response body, or null when the call failed.
 */
export function GetDialogTransmission(
    enduserApiClient,
    dialogId,
    transmissionId,
    labels = null,
) {
    const res = withRetries(
        () => enduserApiClient.GetDialogTransmission(
            dialogId,
            transmissionId,
            labels,
        ),
        "GetDialogTransmission",
    );

    /** @type {V1EndUserDialogsQueriesGetTransmission_Transmission|null} */
    let transmission = null;

    const success = check(res, {
        "GetDialogTransmission - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return transmission;
    }

    check(res, {
        "GetDialogTransmission - body is valid": (r) => {
            try {
                transmission = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return transmission;
}
