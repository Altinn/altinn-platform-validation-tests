import { check } from "k6";

import { TextResource } from "../../../clients/storage/applications.types.js";
import { TextsClient } from "../../../clients/storage/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Updates an existing text resource.
 *
 * @param {TextsClient} textsClient Applications API client.
 * @param {string} org Organization identifier.
 * @param {string} app Application identifier.
 * @param {string} language Language code.
 * @param {TextResource} textResource Updated text resource.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {TextResource|null} Updated text resource.
 */
export function UpdateTextResource(
    textsClient,
    org,
    app,
    language,
    textResource,
    labels = null,
) {
    const res = withRetries(
        () => textsClient.UpdateTextResource(
            org,
            app,
            language,
            textResource,
            labels,
        ),
        "UpdateTextResource",
    );

    /** @type {TextResource|null} */
    let result = null;

    const succeed = check(res, {
        "UpdateTextResource - status code is 200": (r) => r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "UpdateTextResource - body is valid": (r) => {
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
