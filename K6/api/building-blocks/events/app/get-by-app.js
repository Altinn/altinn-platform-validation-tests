import { check } from "k6";

import { AppClient } from "../../../../clients/events/app/index.js";
import { AppEventsByAppQuery, CloudEvent } from "../../../../clients/events/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves events related to an application owner and application.
 *
 * @param {AppClient} appClient Client for the App API.
 * @param {string} org Application owner acronym.
 * @param {string} app Application name.
 * @param {AppEventsByAppQuery|null} [query] Optional query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {CloudEvent[]|null} Cloud events.
 */
export function AppGetByApp(
    appClient,
    org,
    app,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => appClient.AppGetByApp(
            org,
            app,
            query,
            labels,
        ),
        "AppGetByApp",
    );

    /** @type {CloudEvent[]|null} */
    let events = null;

    const succeed = check(res, {
        "AppGetByApp - status code is 200": (r) =>
            r.status === 200,
        "AppGetByApp - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return events;
    }

    check(res, {
        "AppGetByApp - body is valid": (r) => {
            try {
                events = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return events;
}
