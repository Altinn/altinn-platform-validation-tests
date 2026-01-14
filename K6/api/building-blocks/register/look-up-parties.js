import { check } from "k6";
import { RegisterLookupClient } from "../../../clients/authentication/index.js";

/**
 * Lookup parties in Register
 *
 *
 * @param {RegisterLookupClient} registerLookupClient
 * @param {string} fields - Comma separated list of fields to include in result (e.g. "person,party,user")
 * @param {string} username - Username used for request verification
 * @param {{ data: string[] }} requestBody - Request body for lookup.
 *  Example: { data: ["urn:altinn:party:username:Vegard"] } or for instance {"data" : ["urn:altinn:user:id:2051839"]}
 * @param {string | null} label - Optional label for the request tag.
 * @returns {import("k6/http").RefinedResponse}
 */
export function LookUpPartyInRegister(
    registerLookupClient,
    fields,
    username,
    requestBody,
    label = null
) {
    if (requestBody === null || requestBody === undefined) {
        throw new Error("LookUpPartyInRegister: requestBody is required");
    }

    const res = registerLookupClient.LookupParties(fields, requestBody, label);

    const succeed = check(res, {
        "Register LookupParties - status code is 200": (r) => r.status === 200,
        "Register LookupParties - body is not empty": (r) => {
            const resBody = JSON.parse(r.body);
            return resBody !== null && resBody !== undefined;
        },
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }

    return res;
}
