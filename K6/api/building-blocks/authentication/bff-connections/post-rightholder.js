import { check } from "k6";
import { BffConnectionsApiClient } from "../../../../clients/authentication/index.js";

/**
 * Get Authorized Parties
 * @param {BffConnectionsApiClient} bffConnectionsApiClient A client to interact with the bff connections API
 * @param {*} type
 * @param {*} value
 * @param {*} label
 */

export function PostRightholder(bffConnectionsApiClient, from, to, lastName = null, label = null) {
    let res = undefined;
    if (lastName === null) {
        res = bffConnectionsApiClient.PostRightholderOrg(from, to, label);
    } else {
         res = bffConnectionsApiClient.PostRightholder(from, to, lastName, label);
    }
    const succeed = check(res, {
        "PostRightholder - status code is 200": (r) => r.status === 200,
    });
    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }
    return res.json();
}

