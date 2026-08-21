import { check } from "k6";

import { TextResource } from "../../../clients/storage/applications.types.js";
import { TextsClient } from "../../../clients/storage/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Creates a new text resource.
 *
 * @param {TextsClient} textsClient Applications API client.
 * @param {string} org Organization identifier.
 * @param {string} app Application identifier.
 * @param {TextResource} textResource Text resource.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {TextResource|null} Created text resource.
 */
export function CreateTextResource(
    textsClient,
    org,
    app,
    textResource,
    labels = null,
) {
    const res = withRetries(
        () => textsClient.CreateTextResource(
            org,
            app,
            textResource,
            labels,
        ),
        "CreateTextResource",
    );

    /** @type {TextResource|null} */
    let result = null;

    const succeed = check(res, {
        "CreateTextResource - status code is 200": (r) => r.status === 200,
        "CreateTextResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "CreateTextResource - body is valid": (r) => {
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
