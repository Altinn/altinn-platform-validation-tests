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
