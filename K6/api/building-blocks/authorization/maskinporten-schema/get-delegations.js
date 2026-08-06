import { check } from "k6";

import { MaskinportenSchemaApiClient } from "../../../../clients/authorization/index.js";

/**
 * @param {MaskinportenSchemaApiClient} maskinportenSchemaApiClient TODO: description
 * @param {*} queryParams - An object containing key-value pairs to be used as query parameters in the API call
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {object|Array|undefined} The parsed JSON response, or `undefined` if the response body could not be parsed.
 */
export function GetDelegations(maskinportenSchemaApiClient, queryParams, labels = null) {
    const res = maskinportenSchemaApiClient.GetDelegations(queryParams, labels);
    let res_body = undefined;
    const succeed = check(res, {
        "GetDelegations - status code is 200": (r) => r.status === 200,
        "GetDelegations - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetDelegations - body is not empty": (r) => {
            try {
                res_body = JSON.parse(r.body);
                return res_body !== null && res_body !== undefined;
            } catch (error) {
                console.error(`Failed to parse response body: ${error.message}`);
                return false;
            }
        }
    });

    if (!succeed) {
        console.log(queryParams);
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res_body;
}
