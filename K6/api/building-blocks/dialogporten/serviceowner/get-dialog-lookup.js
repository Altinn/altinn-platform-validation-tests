import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Function to get dialogLookup
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} queryParams - query parameters for the request
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @returns response body of the request
 */
export function GetDialogLookup(
    serviceOwnerApiClient,
    queryParams,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogLookup(
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
