import { check } from "k6";
import { ClientDelegationsApiClient } from "../../../../clients/authentication/index.js";

/**
 * Get clients for the specified query parameters
 * @param {ClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function GetMyClients(clientDelegationsApiClient, label = null) {
    const res = clientDelegationsApiClient.GetMyClients(label);
    checker(res, "Get my clients");
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
