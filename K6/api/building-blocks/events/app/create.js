import { check } from "k6";

import { AppClient } from "../../../../clients/events/app/index.js";
import { AppCloudEventRequestModel } from "../../../../clients/events/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Inserts a new event.
 *
 * @param {AppClient} appClient Client for the App API.
 * @param {AppCloudEventRequestModel} request Event payload.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {string|null} Created event identifier.
 */
export function AppCreate(
    appClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => appClient.AppCreate(
            request,
            labels,
        ),
        "AppCreate",
    );

    /** @type {string|null} */
    let eventId = null;

    const succeed = check(res, {
        "AppCreate - status code is 201": (r) =>
            r.status === 201,
        "AppCreate - status text is 201 Created": (r) =>
            r.status_text === "201 Created",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return eventId;
    }

    check(res, {
        "AppCreate - body is valid": (r) => {
            try {
                eventId = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return eventId;
}
