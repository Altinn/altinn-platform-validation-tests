/**
 * Retrieves cloud events based on query parameters.
 *
 * @param {EventsClient} eventsClient Client for the Events API.
 * @param {EventsQueryParams|null} [query] Optional query parameters.
 * @param {string|null} [alternativeSubject] Optional alternative subject header.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 *
 * @returns {CloudEvent[]|null} Cloud events.
 */
export function EventsGet(
    eventsClient,
    query = null,
    alternativeSubject = null,
    labels = null,
) {
    const res = eventsClient.EventsGet(
        query,
        alternativeSubject,
        labels,
    );

    /** @type {CloudEvent[]|null} */
    let events = null;

    const succeed = check(res, {
        "EventsGet - status code is 200": (r) =>
            r.status === 200,
        "EventsGet - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return events;
    }

    check(res, {
        "EventsGet - body is valid": (r) => {
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
