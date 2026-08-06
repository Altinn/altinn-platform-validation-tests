import { check } from "k6";

import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";

/**
 * Confirms a correspondence.
 *
 * @param {CorrespondenceClient} correspondenceClient
 * Client for the Correspondence API.
 * @param {string} correspondenceId
 * Correspondence identifier.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {string|null}
 * The correspondence id, or null if the request failed.
 */
export function ConfirmCorrespondence(
    correspondenceClient,
    correspondenceId,
    labels = null,
) {
    const res = correspondenceClient.ConfirmCorrespondence(
        correspondenceId,
        labels,
    );

    /** @type {string|null} */
    let correspondence = null;

    const succeed = check(res, {
        "ConfirmCorrespondence - status code is 200": (r) =>
            r.status === 200,
        "ConfirmCorrespondence - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);

        return correspondence;
    }

    check(res, {
        "ConfirmCorrespondence - body is valid": (r) => {
            try {
                correspondence = JSON.parse(r.body);

                return typeof correspondence === "string";
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return correspondence;
}
