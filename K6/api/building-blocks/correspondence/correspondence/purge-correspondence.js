import { check } from "k6";

import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";

/**
 * Purges an initialized correspondence.
 *
 * Correspondences can only be purged before they have been published.
 *
 * @param {CorrespondenceClient} correspondenceClient
 * Client for the Correspondence API.
 * @param {string} correspondenceId
 * Correspondence identifier.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {string|null}
 * The purged correspondence id, or null if the request failed.
 */
export function PurgeCorrespondence(
    correspondenceClient,
    correspondenceId,
    labels = null,
) {
    const res = correspondenceClient.PurgeCorrespondence(
        correspondenceId,
        labels,
    );

    /** @type {string|null} */
    let purgedCorrespondenceId = null;

    const succeed = check(res, {
        "PurgeCorrespondence - status code is 200": (r) =>
            r.status === 200,
        "PurgeCorrespondence - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);

        return purgedCorrespondenceId;
    }

    check(res, {
        "PurgeCorrespondence - body is valid": (r) => {
            try {
                purgedCorrespondenceId = JSON.parse(r.body);

                return typeof purgedCorrespondenceId === "string";
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return purgedCorrespondenceId;
}
