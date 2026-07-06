import { check } from "k6";

import { BffClientDelegationsApiClient } from "../../../../clients/authorization/index.js";

/**
 * Get agents for the specified query parameters
 * @param {BffClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 */
export function GetAgents(clientDelegationsApiClient, queryParams, labels = null) {
    const res = clientDelegationsApiClient.GetAgents(queryParams, labels);
    checker(res, "Get agents");
    return res.body;
}

/**
 * Post agents for the specified query parameters
 * @param {BffClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 */
export function PostAgents(clientDelegationsApiClient, queryParams, to, lastName, labels = null) {
    const res = clientDelegationsApiClient.PostAgents(queryParams, to, lastName, labels);
    checker(res, "Post agents");
    return res.body;
}

/**
 * Delete agents for the specified query parameters
 * @param {BffClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 */
export function DeleteAgents(clientDelegationsApiClient, queryParams, labels = null) {
    const res = clientDelegationsApiClient.DeleteAgents(queryParams, labels);
    checker(res, "Delete agents", 204, "204 No Content");
    return res.body;
}

/**
 * Get clients for the specified query parameters
 * @param {BffClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 */
export function GetClients(clientDelegationsApiClient, queryParams, labels = null) {
    const res = clientDelegationsApiClient.GetClients(queryParams, labels);
    checker(res, "Get clients");
    return res.body;
}

/**
 * Delegation Export
 * @param {BffAccessManagementApiClient} accessManagementApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @return {Object} response body
 */
export function DelegationExport(accessManagementApiClient, queryParams, labels = null) {
    const res = accessManagementApiClient.DelegationExport(queryParams, labels);
    checker(res, "Export delegations");
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
