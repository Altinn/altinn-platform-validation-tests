import { check } from "k6";

import { InstansiationInstance } from "../../../clients/apps/apps.types.js";
import { InstancesClient } from "../../../clients/apps/index.js";
import { Instance } from "../../../clients/storage/instances.types.js";
import { withRetries } from "../common/retry.js";

/**
 * Creates an instance from a simplified instance template, with optional prefill.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {string} org The service owner of the app.
 * @param {string} app The app name.
 * @param {InstansiationInstance} request The instance owner, and what to prefill.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function PostSimplified(
    instancesClient,
    org,
    app,
    request,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.PostSimplified(
            org,
            app,
            request,
            labels,
        ),
        "PostSimplified",
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "PostSimplified - status code is 201": (r) => r.status === 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "PostSimplified - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}
