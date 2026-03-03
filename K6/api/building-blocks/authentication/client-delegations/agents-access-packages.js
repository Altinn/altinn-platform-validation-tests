import { check } from "k6";
import { BffClientDelegationsApiClient } from "../../../../clients/authentication/index.js";

/**
 * Get access packages for the specified query parameters
 * @param {BffClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function GetAccessPackages(clientDelegationsApiClient, queryParams, label = null) {
    const res = clientDelegationsApiClient.GetAgentsAccessPackages(queryParams, label);
    checker(res, "Get access packages");
    return res.body;
}

/**
 * Post access packages for the specified query parameters
 * @param {BffClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function PostAccessPackages(clientDelegationsApiClient, queryParams, accessPackage, label = null) {
    const res = clientDelegationsApiClient.PostAgentsAccessPackages(queryParams, accessPackage, label);
    checker(res, "Post access packages");
    return res.body;
}

/**
 * Delete access packages for the specified query parameters
 * @param {BffClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function DeleteAccessPackages(clientDelegationsApiClient, queryParams, accessPackage, label = null) {
    const res = clientDelegationsApiClient.DeleteAgentsAccessPackages(queryParams, accessPackage, label);
    checker(res, "Delete access packages", 204, "204 No Content");
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
