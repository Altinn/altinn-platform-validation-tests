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
    requestBody,
    label = null,
) {
    if (requestBody === null || requestBody === undefined) {
        throw new Error("LookUpPartyInRegister: requestBody is required");
    }

    const res = registerLookupClient.LookupParties(fields, requestBody, label);

    const success = check(res, {
        "Register LookupParties - status code should be 200": (r) =>
            r.status === 200,
        "Register LookupParties - body is not empty": (r) => {},
    });

    if (!success) {
        console.error(res.status);
        console.error(res.body);
    }

    return res;
}
