import { check } from "k6";
import { AuthorizedPartiesClient } from "../../../../clients/auth/index.js";

/**
 * Get Authorized Parties
 * @param {AuthorizedPartiesClient} authorizedPartiesClient A client to interact with the Authorized Parties API
 * @param {*} type
 * @param {*} value
 * @param {*} label
 */

export function GetAuthorizedParties(authorizedPartiesClient, type, value, queryParams, label = null, partyFilter = null) {
    const res = authorizedPartiesClient.GetAuthorizedParties(type, value, queryParams, label, partyFilter);

    const succeed = check(res, {
        "GetAuthorizedParties - status code is 200": (r) => r.status === 200,
        "GetAuthorizedParties - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetAuthorizedParties - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });
    if (!succeed) {
        console.log(type, value, partyFilter);
        console.log(res.status);
        console.log(res.body);
    }
    return res.json();
}
