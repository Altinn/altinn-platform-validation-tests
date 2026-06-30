import { check } from "k6";
import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Function to get dialogLookup
 * @param {EnduserApiClient} enduserApiClient
 * @param {string} queryParams - query parameters for the request
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @return response body of the request
 */
export function GetDialogLookup(
    enduserApiClient,
    queryParams,
    labels = null,
) {
    const res = enduserApiClient.GetDialogLookup(
        queryParams,
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
