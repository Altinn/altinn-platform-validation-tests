import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Function to get parties
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1AccessManagementQueriesGetParties_Parties|null} Parsed response body, or null when the call failed.
 */
export function GetParties(
    enduserApiClient,
    labels = null,
) {
    const res = enduserApiClient.GetParties(
        labels,
    );

    /** @type {V1AccessManagementQueriesGetParties_Parties|null} */
    let parties = null;

    const success = check(res, {
        "GetParties - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return parties;
    }

    check(res, {
        "GetParties - body is valid": (r) => {
            try {
                parties = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return parties;
}
