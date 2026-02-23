import { check } from "k6";
import { ClientDelegationsApiClient } from "../../../../clients/authentication/index.js";

/**
 * Get agents for the specified query parameters
 * @param {ClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function GetAgents(clientDelegationsApiClient, queryParams, label = null) {
    const res = clientDelegationsApiClient.GetAgents(queryParams, label);
    checker(res, "Get agents");
    return res.body;
}

/**
 * Post agents for the specified query parameters
 * @param {ClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function PostAgents(clientDelegationsApiClient, queryParams, to, lastName, label = null) {
  const res = clientDelegationsApiClient.PostAgents(queryParams, to, lastName, label);
  checker(res, "Post agents");
  return res.body;
}

/**
 * Delete agents for the specified query parameters
 * @param {ClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function DeleteAgents(clientDelegationsApiClient, queryParams, label = null) {
  const res = clientDelegationsApiClient.DeleteAgents(queryParams, label);
  checker(res, "Delete agents", 204, "204 No Content");
  return res.body;
}

/**
 * Get access packages for the specified query parameters
 * @param {ClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function GetAccessPackages(clientDelegationsApiClient, queryParams, label = null) {
  const res = clientDelegationsApiClient.GetAccessPackages(queryParams, label);
  checker(res, "Get access packages");
  return res.body;
}

/**
 * Post access packages for the specified query parameters
 * @param {ClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function PostAccessPackages(clientDelegationsApiClient, queryParams, accessPackage, label = null) {
  const res = clientDelegationsApiClient.PostAccessPackages(queryParams, accessPackage, label);
  checker(res, "Post access packages");
  return res.body;
}

/**
 * Delete access packages for the specified query parameters
 * @param {ClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function DeleteAccessPackages(clientDelegationsApiClient, queryParams, accessPackage, label = null) {
  const res = clientDelegationsApiClient.DeleteAccessPackages(queryParams, accessPackage, label);
  checker(res, "Delete access packages", 204, "204 No Content");
  return res.body;
}

/**
 * Get clients for the specified query parameters
 * @param {ClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function GetClients(clientDelegationsApiClient, queryParams, label = null) {
  const res = clientDelegationsApiClient.GetClients(queryParams, label);
  checker(res, "Get clients");
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
