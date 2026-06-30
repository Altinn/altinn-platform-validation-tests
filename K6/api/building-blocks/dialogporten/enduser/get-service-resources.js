import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Function to get service resources
 * @param {EnduserApiClient} enduserApiClient
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @return response body of the request
 */
export function GetServiceResources(
    enduserApiClient,
    labels = null,
) {
    const res = enduserApiClient.GetServiceResources(
        labels,
    );

    const success = check(res, {
        "GetServiceResources - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}
