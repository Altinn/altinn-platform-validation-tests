import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";
import { V1EndUserServiceResourcesQueriesSearch_AuthorizedServiceResources } from "../../../../clients/dialogporten/enduser/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Function to get service resources
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
 * @returns {V1EndUserServiceResourcesQueriesSearch_AuthorizedServiceResources|null} Parsed response body, or null when the call failed.
 */
export function GetServiceResources(
    enduserApiClient,
    labels = null,
) {
    const res = withRetries(
        () => enduserApiClient.GetServiceResources(
            labels,
        ),
        "GetServiceResources",
    );

    /** @type {V1EndUserServiceResourcesQueriesSearch_AuthorizedServiceResources|null} */
    let serviceResources = null;

    const success = check(res, {
        "GetServiceResources - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return serviceResources;
    }

    check(res, {
        "GetServiceResources - body is valid": (r) => {
            try {
                serviceResources = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return serviceResources;
}
