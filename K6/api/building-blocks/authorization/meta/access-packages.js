import { check } from "k6";

import { MetaApiClient } from "../../../../clients/authorization/index.js";

/**
 * Get Access Packages Export - fetch the full access package catalogue.
 * @param {MetaApiClient} metaApiClient A client to interact with the /meta API
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @returns parsed catalogue (array of groups, each with areas -> packages)
 */
export function GetAccessPackagesExport(metaApiClient, labels = null) {
    const res = metaApiClient.GetAccessPackagesExport(labels);
    const succeed = check(res, {
        "GetAccessPackagesExport - status code is 200": (r) => r.status === 200,
        "GetAccessPackagesExport - body is a non-empty array": (r) => {
            const res_body = JSON.parse(r.body);
            return Array.isArray(res_body) && res_body.length > 0;
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
    }
    return res.json();
}
