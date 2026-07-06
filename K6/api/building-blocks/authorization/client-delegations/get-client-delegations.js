import { check } from "k6";

import { ClientDelegationsApiClient } from "../../../../clients/authorization/index.js";

/**
 * Get clients for the specified query parameters
 *
 * @param {ClientDelegationsApiClient} clientDelegationsApiClient A client to interact with the client delegations API
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetMyClients(clientDelegationsApiClient, labels = null) {
    const res = clientDelegationsApiClient.GetMyClients(labels);
    checker(res, "Get my clients");
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
