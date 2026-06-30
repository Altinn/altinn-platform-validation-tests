import { BffSingleRightApiClient } from "../../../../clients/authentication/index.js";
import { check } from "k6";

/**
 * Post single right for the specified query parameters
 * @param {BffSingleRightApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 */
export function PostSingleRight(bffSingleRightApiClient, queryParams, rights, labels = null) {
    const res = bffSingleRightApiClient.PostDelegate(queryParams, rights, labels);
    checker(res, "Post single right");
    return res.body;
}

/**
 * Revoke single right for the specified query parameters
 * @param {BffSingleRightApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 * @return (string | ArrayBuffer | null)
 * */
export function RevokeSingleRight(bffSingleRightApiClient, queryParams, labels = null) {
    const res = bffSingleRightApiClient.DeleteDelegate(queryParams, labels);
    checker(res, "Revoke single right");
    return res.body;
}

/**
 * Get delegation check for a resource
 * @param {BffSingleRightApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {*} queryParams - query parameters for the request
 * @param {*} labels - labels for the request, if null the url will be used as label
 * @return (string | ArrayBuffer | null)
 */
export function GetDelegationCheck(bffSingleRightApiClient, queryParams, labels = null) {
    const res = bffSingleRightApiClient.GetDelegationCheck(queryParams, labels);
    checker(res, "Get delegation check");
    return res.body;
}

/**
 * Function to check common response properties
 * @param {} res - response object
 * @param {*} method - method name for logging
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
