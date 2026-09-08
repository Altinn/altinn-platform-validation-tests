import { check } from "k6";

import { TextsClient } from "../../../clients/storage/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Deletes an existing text resource.
 *
 * @param {TextsClient} textsClient Applications API client.
 * @param {string} org Organization identifier.
 * @param {string} app Application identifier.
 * @param {string} language Language code.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True when deletion succeeds.
 */
export function DeleteTextResource(
    textsClient,
    org,
    app,
    language,
    labels = null,
) {
    const res = withRetries(
        () => textsClient.DeleteTextResource(
            org,
            app,
            language,
            labels,
        ),
        "DeleteTextResource",
    );

    const succeed = check(res, {
        "DeleteTextResource - status code is 200": (r) => r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);

        return false;
    }

    return true;
}
