import { check } from "k6";

import { AppClient } from "../../../../clients/app/index.js";

/**
 * Retrieves events related to a party.
 *
 * @param {AppClient} appClient Client for the App API.
 * @param {Object} [query] Optional query parameters.
 * @param {string} [person] Person number header value.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {CloudEvent[]|null} Cloud events.
 */
export function AppGetByParty(
    appClient,
    query = null,
    person = null,
    labels = null,
) {
    const res = appClient.AppGetByParty(
        query,
        person,
        labels,
    );

    /** @type {CloudEvent[]|null} */
    let events = null;

    const succeed = check(res, {
        "AppGetByParty - status code is 200": (r) =>
            r.status === 200,
        "AppGetByParty - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return events;
    }

    check(res, {
        "AppGetByParty - body is valid": (r) => {
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
