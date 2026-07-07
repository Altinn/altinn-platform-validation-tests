import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Function to get dialogLookup
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns response body of the request
 */
export function GetDialogLookup(
    enduserApiClient,
    dialogId,
    labels = null,
) {
    const res = enduserApiClient.GetDialogLookup(
        dialogId,
        labels,
    );

    const success = check(res, {
        "GetDialogLookup - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}
