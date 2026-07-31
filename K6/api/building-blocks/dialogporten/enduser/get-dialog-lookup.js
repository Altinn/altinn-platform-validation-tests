import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Function to get dialogLookup
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1CommonIdentifierLookup_EndUserIdentifierLookup|null} Parsed response body, or null when the call failed.
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

    /** @type {V1CommonIdentifierLookup_EndUserIdentifierLookup|null} */
    let dialogLookup = null;

    const success = check(res, {
        "GetDialogLookup - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dialogLookup;
    }

    check(res, {
        "GetDialogLookup - body is valid": (r) => {
            try {
                dialogLookup = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dialogLookup;
}
