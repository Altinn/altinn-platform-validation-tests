import { check } from "k6";

import { AppProcessState } from "../../../clients/apps/apps.types.js";
import { ProcessClient } from "../../../clients/apps/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Moves the process of an instance on to the next element.
 *
 * @param {ProcessClient} processClient Client for the API.
 * @param {string} org The service owner of the app.
 * @param {string} app The app name.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {AppProcessState|null} Parsed response body, or null when the call failed.
 */
export function NextElement(
    processClient,
    org,
    app,
    instanceOwnerPartyId,
    instanceGuid,
    labels = null,
) {
    const res = withRetries(
        () => processClient.NextElement(
            org,
            app,
            instanceOwnerPartyId,
            instanceGuid,
            labels,
        ),
        "NextElement",
    );

    /** @type {AppProcessState|null} */
    let processState = null;

    const success = check(res, {
        "NextElement - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return processState;
    }

    check(res, {
        "NextElement - body is valid": (r) => {
            try {
                processState = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return processState;
}
