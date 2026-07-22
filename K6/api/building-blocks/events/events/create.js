import { check } from "k6";

import { EventsClient } from "../../../../clients/events/index.js";

/**
 * Posts a new CloudEvent.
 *
 * @param {EventsClient} eventsClient Client for the Events API.
 * @param {CloudEvent} event CloudEvent payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 *
 * @returns {string|null} Created event identifier.
 */
export function EventsCreate(
    eventsClient,
    event,
    labels = null,
) {
    const res = eventsClient.EventsCreate(
        event,
        labels,
    );

    /** @type {string|null} */
    let eventId = null;

    const succeed = check(res, {
        "EventsCreate - status code is 200": (r) =>
            r.status === 200,
        "EventsCreate - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return eventId;
    }

    check(res, {
        "EventsCreate - body is valid": (r) => {
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
