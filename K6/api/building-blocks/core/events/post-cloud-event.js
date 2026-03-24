import { check } from "k6";
import { EventsApiClient } from "../../../../clients/core/events/index.js"

/**
 * @param {EventsApiClient} eventsApiClient
 * @param {string } id
 * @param {string } source
 * @param {string } specversion
 * @param {string } type
 * @param {string } subject
 * @param {string } resource
 * @param {string } time
 * @returns (string | ArrayBuffer | null)
 */
export function PostCloudEvent(
    eventsApiClient,
    id,
    source,
    specversion,
    type,
    subject,
    resource,
    time
) {
    const response = eventsApiClient.PostCloudEvent(
        id,
        source,
        specversion,
        type,
        subject,
        resource,
        time
    );

    const success = check(response, {
        "PostCloudEvent. Status is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.error(response.status);
        console.error(response.body);
    }

    return response.body;
}
