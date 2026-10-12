import { check } from "k6";

import { EventsClient } from "../../../../clients/events/events/index.js";
import { CloudEvent } from "../../../../clients/events/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Posts a new CloudEvent.
 *
 * The API answers 200 with an empty body, so a caller that needs the event id
 * sets `id` on the event itself.
 *
 * @param {EventsClient} eventsClient Client for the Events API.
 * @param {CloudEvent} event CloudEvent payload.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @param {string|null} [idempotencyKey] Optional GUID reused across retries to skip duplicate submissions.
 * @returns {boolean} Whether the event was registered.
 */
export function EventsCreate(
    eventsClient,
    event,
    labels = null,
    idempotencyKey = null,
) {
    const res = withRetries(
        () => eventsClient.EventsCreate(
            event,
            labels,
            idempotencyKey,
        ),
        "EventsCreate",
    );

    const succeed = check(res, {
        "EventsCreate - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
