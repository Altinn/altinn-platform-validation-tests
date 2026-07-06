import { check } from "k6";

import { RegisterLookupClient } from "../../../clients/authentication/index.js";

/**
 * Lookup parties in Register
 *
 * @param {RegisterLookupClient} registerLookupClient TODO: description
 * @param {string} fields - Comma separated list of fields to include in result (e.g. "person,party,user")
 * @param {{ data: string[] }} requestBody - Request body for lookup.
 * Example: { data: ["urn:altinn:party:username:Vegard"] } or for instance {"data" : ["urn:altinn:user:id:2051839"]}
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {import("k6/http").RefinedResponse} TODO: description
 */
export function LookUpPartyInRegister(
    registerLookupClient,
    fields,
    requestBody,
    labels = null,
) {
    if (requestBody === null || requestBody === undefined) {
        throw new Error("LookUpPartyInRegister: requestBody is required");
    }

    const res = registerLookupClient.LookupParties(fields, requestBody, labels);

    const success = check(res, {
        "Register LookupParties - status code should be 200": (r) =>
            r.status === 200,

        "Register LookupParties - body is not empty": (r) => {
            return r.body && r.body.length > 0;
        },
    });

    if (!success) {
        console.error(res.status);
        console.error(res.body);
    }

    return res;
}
