import { check } from "k6";

import { ConnectionsApiClient } from "../../../../clients/authentication/index.js";

/**
 * Post Connection - create an assignment between two parties (e.g. a user adding an organization).
 * @param {ConnectionsApiClient} connectionsApiClient A client to interact with the /enduser/connections API
 * @param {*} queryParams - query parameters for the request (party, from, to)
 * @param {string|null} body - optional request body (e.g. { personidentifier, lastName } when adding a person)
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @returns (string | ArrayBuffer | null) - response body
 */
export function PostConnection(connectionsApiClient, queryParams, body = null, labels = null) {
    const res = connectionsApiClient.PostConnection(queryParams, body, labels);
    const succeed = check(res, {
        "PostConnection - status code is 200 or 201": (r) => r.status === 200 || r.status === 201,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.body;
}
