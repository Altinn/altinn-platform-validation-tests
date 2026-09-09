import { check } from "k6";

import { AppClient } from "../../../../clients/events/app/index.js";
import { AppPartyEventsQuery, CloudEvent } from "../../../../clients/events/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves events related to a party.
 *
 * @param {AppClient} appClient Client for the App API.
 * @param {AppPartyEventsQuery|null} [query] Optional query parameters.
 * @param {string|null} [person] Person number header value.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {CloudEvent[]|null} Cloud events.
 */
export function AppGetByParty(
    appClient,
    query = null,
    person = null,
    labels = null,
) {
    const res = withRetries(
        () => appClient.AppGetByParty(
            query,
            person,
            labels,
        ),
        "AppGetByParty",
    );

    /** @type {CloudEvent[]|null} */
    let events = null;

    const succeed = check(res, {
        "AppGetByParty - status code is 200": (r) =>
            r.status === 200,
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
