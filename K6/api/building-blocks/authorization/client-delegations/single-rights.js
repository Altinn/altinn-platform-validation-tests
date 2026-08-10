import { check } from "k6";

import { BffSingleRightApiClient } from "../../../../clients/authorization/index.js";

/**
 * Post single right for the specified query parameters
 *
 * @param {BffSingleRightApiClient} bffSingleRightApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param rights TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function PostSingleRight(bffSingleRightApiClient, queryParams, rights, labels = null) {
    const res = bffSingleRightApiClient.PostDelegate(queryParams, rights, labels);
    checker(res, "Post single right");
    return res.body;
}

/**
 * Revoke single right for the specified query parameters
 *
 * @param {BffSingleRightApiClient} bffSingleRightApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns (string | ArrayBuffer | null)
 * */
export function RevokeSingleRight(bffSingleRightApiClient, queryParams, labels = null) {
    const res = bffSingleRightApiClient.DeleteDelegate(queryParams, labels);
    checker(res, "Revoke single right");
    return res.body;
}

/**
 * Get delegation check for a resource
 *
 * @param {BffSingleRightApiClient} bffSingleRightApiClient A client to interact with the client delegations API
 * @param {*} queryParams - query parameters for the request
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs., if null the url will be used as label
 * @returns (string | ArrayBuffer | null)
 */
export function GetDelegationCheck(bffSingleRightApiClient, queryParams, labels = null) {
    const res = bffSingleRightApiClient.GetDelegationCheck(queryParams, labels);
    checker(res, "Get delegation check");
    return res.body;
}

/**
 * Function to check common response properties
 *
 * @param {} res - response object
 * @param {*} method - method name for logging
 * @param status_code TODO: description
 * @param status_text TODO: description
 */
function checker(res, method, status_code = 200, status_text = "200 OK") {
    const succeed = check(res, {
        [`${method} - status code is ${status_code}`]: (r) => r.status === status_code,
        [`${method} - status text is ${status_text}`]: (r) => r.status_text == status_text,
    });
    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    };
}
