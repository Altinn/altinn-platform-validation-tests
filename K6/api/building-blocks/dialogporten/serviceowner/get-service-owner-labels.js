import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { V1ServiceOwnerServiceOwnerContextQueriesGetServiceOwnerLabels_ServiceOwnerLabel } from "../../../../clients/dialogporten/serviceowner/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Function to get serviceowner labels
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get labels for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1ServiceOwnerServiceOwnerContextQueriesGetServiceOwnerLabels_ServiceOwnerLabel[]} Parsed response body, or an empty array when the call failed.
 */
export function GetServiceOwnerLabels(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerApiClient.GetServiceOwnerLabels(
            dialogId,
            labels,
        ),
        "GetServiceOwnerLabels",
    );

    /** @type {V1ServiceOwnerServiceOwnerContextQueriesGetServiceOwnerLabels_ServiceOwnerLabel[]} */
    let serviceOwnerLabels = [];

    const success = check(res, {
        "GetServiceOwnerLabels - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return serviceOwnerLabels;
    }

    check(res, {
        "GetServiceOwnerLabels - body is valid": (r) => {
            try {
                serviceOwnerLabels = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return serviceOwnerLabels;
}
