import { check } from "k6";

import { InitializeCorrespondencesResponseExt } from "../../../../clients/correspondence/correspondence.types.js";
import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Initializes correspondences and uploads attachment data as multipart form
 * data.
 *
 * @param {CorrespondenceClient} correspondenceClient Client for the Correspondence API.
 * @param {{[key: string]: string|import("k6/http").FileData}} formData Multipart form fields and attachment data.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {InitializeCorrespondencesResponseExt|null}
 * Initialized correspondence information or null when request fails.
 */
export function UploadCorrespondences(
    correspondenceClient,
    formData,
    labels = null,
) {
    const res = withRetries(
        () => correspondenceClient.UploadCorrespondences(
            formData,
            labels,
        ),
        "UploadCorrespondences",
    );

    /** @type {InitializeCorrespondencesResponseExt|null} */
    let initializedCorrespondences = null;

    const succeed = check(res, {
        "UploadCorrespondences - status code is 200": (r) =>
            r.status === 200,

        "UploadCorrespondences - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return initializedCorrespondences;
    }

    check(res, {
        "UploadCorrespondences - body is valid": (r) => {
            try {
                initializedCorrespondences = JSON.parse(r.body);

                return initializedCorrespondences !== null;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return initializedCorrespondences;
}
