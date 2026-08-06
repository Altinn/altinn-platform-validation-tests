import { check } from "k6";

import { MaskinportenSchemaApiClient } from "../../../../clients/authorization/index.js";

/**
 *
 * @param {MaskinportenSchemaApiClient} maskinportenSchemaApiClient A client to interact with the /accesspackage API
 * @param from TODO: description
 * @param to TODO: description
 * @param resource TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns (string | ArrayBuffer | null)
 */
export function PostOffered(maskinportenSchemaApiClient, from, to, resource, labels = null) {
    const res = maskinportenSchemaApiClient.PostOffered(from, to, resource, labels);
    const succeed = check(res, {
        "PostOffered - status code is 201": (r) => r.status === 201,
        "PostOffered - status text is 201 Created": (r) => r.status_text == "201 Created",
        "PostOffered - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.body;
}
