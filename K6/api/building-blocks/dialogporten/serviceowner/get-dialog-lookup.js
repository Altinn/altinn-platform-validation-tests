import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Function to get dialogLookup
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {string} queryParams - query parameters for the request
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1CommonIdentifierLookup_ServiceOwnerIdentifierLookup|null} Parsed response body, or null when the call failed.
 */
export function GetDialogLookup(
    serviceOwnerApiClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerApiClient.GetDialogLookup(
            queryParams,
            labels,
        ),
        "GetDialogLookup",
    );

    /** @type {V1CommonIdentifierLookup_ServiceOwnerIdentifierLookup|null} */
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
