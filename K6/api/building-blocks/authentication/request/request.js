import { check } from "k6";

import { RequestApiClient } from "../../../../clients/authentication/index.js";

/**
 * Post Package - Bruker A requests an access package from another party.
 * @param {RequestApiClient} requestApiClient A client to interact with the /enduser/request API
 * @param {string} from - the party making the request (party uuid).
 * @param {string} to - the party the request is directed to (party uuid).
 * @param {string} accessPackage - urn of the access package, e.g. "urn:altinn:accesspackage:motorvognavgift".
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @returns parsed RequestDto for the created request
 */
export function PostPackage(requestApiClient, from, to, accessPackage, labels = null) {
    const res = requestApiClient.PostPackage(from, to, accessPackage, labels);
    const succeed = check(res, {
        "PostPackage - status code is 200": (r) => r.status === 200,
        "PostPackage - body has request id": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body.id !== undefined;
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.json();
}

/**
 * Get Received - Bruker lists requests received by a party.
 * @param {RequestApiClient} requestApiClient A client to interact with the /enduser/request API
 * @param {*} queryParams - query parameters for the request (party, optionally from, status, type)
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @returns parsed RequestDtoPaginatedResult
 */
export function GetReceived(requestApiClient, queryParams, labels = null) {
    const res = requestApiClient.GetReceived(queryParams, labels);
    console.log(res.body);
    console.log(res.status);
    const succeed = check(res, {
        "GetReceived - status code is 200": (r) => r.status === 200,
        "GetReceived - body has data array": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && Array.isArray(res_body.data);
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.json();
}

/**
 * Approve - Bruker approves a received request.
 * @param {RequestApiClient} requestApiClient A client to interact with the /enduser/request API
 * @param {*} queryParams - query parameters for the request (party, id)
 * @param {string[]} body - references to approve (empty list approves the request as is)
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @returns parsed RequestDto for the approved request
 */
export function Approve(requestApiClient, queryParams, body = [], labels = null) {
    const res = requestApiClient.Approve(queryParams, body, labels);
    const succeed = check(res, {
        "Approve - status code is 200": (r) => r.status === 200,
        "Approve - request status is Approved": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body.status === "Approved";
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.json();
}

/**
 * Reject - Bruker B rejects a received request.
 * @param {RequestApiClient} requestApiClient A client to interact with the /enduser/request API
 * @param {*} queryParams - query parameters for the request (party, id)
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @returns parsed RequestDto for the rejected request
 */
export function Reject(requestApiClient, queryParams, labels = null) {
    const res = requestApiClient.Reject(queryParams, labels);
    const succeed = check(res, {
        "Reject - status code is 200": (r) => r.status === 200,
        "Reject - request status is Rejected": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body.status === "Rejected";
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.json();
}
