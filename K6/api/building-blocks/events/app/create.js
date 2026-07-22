import { check } from "k6";

import { AppClient } from "../../../../clients/app/index.js";

/**
 * Inserts a new event.
 *
 * @param {AppClient} appClient Client for the App API.
 * @param {AppCloudEventRequestModel} request Event payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {string|null} Created event identifier.
 */
export function AppCreate(
    appClient,
    request,
    labels = null,
) {
    const res = appClient.AppCreate(
        request,
        labels,
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
