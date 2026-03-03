import { check } from "k6";
import { BffConnectionsApiClient } from "../../../../clients/authentication/index.js";

/**
 * Get Authorized Parties
 * @param {BffConnectionsApiClient} bffConnectionsApiClient A client to interact with the bff connections API
 * @param {*} from - party id for the from user
 * @param {*} to - party id for the to user
 * @param {*} lastName - last name of the to user, needed for creating a rightholder connection
 * @param {*} label - label for the request
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
        console.log("PostRightholder failed");
        console.log(res.status);
        console.log(res.body);
    }
    return res.json();
}

