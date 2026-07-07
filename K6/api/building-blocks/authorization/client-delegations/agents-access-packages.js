import { check } from "k6";

import { BffClientDelegationsApiClient } from "../../../../clients/authorization/index.js";

/**
 * Get access packages for the specified query parameters
 *
 * @param {BffClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetAccessPackages(clientDelegationsApiClient, queryParams, labels = null) {
    const res = clientDelegationsApiClient.GetAgentsAccessPackages(queryParams, labels);
    checker(res, "Get access packages");
    return res.body;
}

/**
 * Post access packages for the specified query parameters
 *
 * @param {BffClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param accessPackage TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function PostAccessPackages(clientDelegationsApiClient, queryParams, accessPackage, labels = null) {
    const res = clientDelegationsApiClient.PostAgentsAccessPackages(queryParams, accessPackage, labels);
    checker(res, "Post access packages");
    return res.body;
}

/**
 * Delete access packages for the specified query parameters
 *
 * @param {BffClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param accessPackage TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function DeleteAccessPackages(clientDelegationsApiClient, queryParams, accessPackage, labels = null) {
    const res = clientDelegationsApiClient.DeleteAgentsAccessPackages(queryParams, accessPackage, labels);
    checker(res, "Delete access packages", 204, "204 No Content");
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
