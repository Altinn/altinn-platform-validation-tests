import { check } from "k6";
import { MaskinportenSchemaApiClient } from "../../../../clients/authentication/index.js";

/**
 * 
 * @param {MaskinportenSchemaApiClient} maskinportenSchemaApiClient A client to interact with the /accesspackage API
 * 
 * @returns (string | ArrayBuffer | null)
 */
export function PostOffered(maskinportenSchemaApiClient, from, to, resource, label = null) {
    const res = maskinportenSchemaApiClient.PostOffered(from, to, resource, label);
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