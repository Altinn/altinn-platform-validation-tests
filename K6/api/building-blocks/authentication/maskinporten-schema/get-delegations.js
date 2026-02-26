import { check } from "k6";
import { MaskinportenSchemaApiClient } from "../../../../clients/authentication/index.js";

/**
 * 
 * @param {MaskinportenSchemaApiClient} maskinportenSchemaApiClient A client to interact with the /accesspackage API
 * 
 * @returns (string | ArrayBuffer | null)
 */
export function GetDelegations(maskinportenSchemaApiClient, queryParams, label = null) {
    const res = maskinportenSchemaApiClient.GetDelegations(queryParams, label);
    const succeed = check(res, {
        "GetDelegations - status code is 200": (r) => r.status === 200,
        "GetDelegations - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetDelegations - body is not empty": (r) => {
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

