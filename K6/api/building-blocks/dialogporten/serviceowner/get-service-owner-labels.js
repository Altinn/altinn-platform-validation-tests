import { check } from "k6";
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";


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
