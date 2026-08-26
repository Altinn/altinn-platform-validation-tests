import { check } from "k6";

import { TextResource } from "../../../clients/storage/applications.types.js";
import { TextsClient } from "../../../clients/storage/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Gets a text resource.
 *
 * @param {TextsClient} textsClient Applications API client.
 * @param {string} org Organization identifier.
 * @param {string} app Application identifier.
 * @param {string} language Language code.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {TextResource|null} Text resource.
 */
export function GetTextResource(
    textsClient,
    org,
    app,
    language,
    labels = null,
) {
    const res = withRetries(
        () => textsClient.GetTextResource(
            org,
            app,
            language,
            labels,
        ),
        "GetTextResource",
    );

    /** @type {TextResource|null} */
    let result = null;

    const succeed = check(res, {
        "GetTextResource - status code is 200": (r) => r.status === 200,
        "GetTextResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "GetTextResource - body is valid": (r) => {
            try {
                result = JSON.parse(r.body);
                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);
                return false;
            }
        },
    });

    return result;
}
