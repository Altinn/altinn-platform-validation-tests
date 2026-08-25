import { check } from "k6";

import { InstanceEventsClient } from "../../../clients/storage/index.js";
import { InstanceEvent, InstanceEventList } from "../../../clients/storage/instances.types.js";
import { withRetries } from "../common/retry.js";

/**
 * Adds an event to an instance.
 *
 * @param {InstanceEventsClient} instanceEventsClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {InstanceEvent} request Event to store.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {string|null} Parsed response body, or null when the call failed.
 */
export function CreateInstanceEvent(
    instanceEventsClient,
    instanceOwnerPartyId,
    instanceGuid,
    request,
    labels = null,
) {
    const res = withRetries(
        () => instanceEventsClient.CreateInstanceEvent(
            instanceOwnerPartyId,
            instanceGuid,
            request,
            labels,
        ),
        "CreateInstanceEvent",
    );

    /** @type {string|null} */
    let eventId = null;

    const success = check(res, {
        "CreateInstanceEvent - status code is 201": (r) => r.status === 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return eventId;
    }

    check(res, {
        "CreateInstanceEvent - body is valid": (r) => {
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

/**
 * Gets the events of an instance.
 *
 * @param {InstanceEventsClient} instanceEventsClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {Array<string>} eventTypes Event types to include.
 * @param {string} from Only include events from this timestamp.
 * @param {string} to Only include events up to this timestamp.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {InstanceEventList|null} Parsed response body, or null when the call failed.
 */
export function GetInstanceEvents(
    instanceEventsClient,
    instanceOwnerPartyId,
    instanceGuid,
    eventTypes = null,
    from = null,
    to = null,
    labels = null,
) {
    const res = withRetries(
        () => instanceEventsClient.GetInstanceEvents(
            instanceOwnerPartyId,
            instanceGuid,
            eventTypes,
            from,
            to,
            labels,
        ),
        "GetInstanceEvents",
    );

    /** @type {InstanceEventList|null} */
    let events = null;

    const success = check(res, {
        "GetInstanceEvents - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return events;
    }

    check(res, {
        "GetInstanceEvents - body is valid": (r) => {
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

/**
 * Gets a single event of an instance.
 *
 * @param {InstanceEventsClient} instanceEventsClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} eventGuid Event UUID.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {InstanceEvent|null} Parsed response body, or null when the call failed.
 */
export function GetInstanceEvent(
    instanceEventsClient,
    instanceOwnerPartyId,
    instanceGuid,
    eventGuid,
    labels = null,
) {
    const res = withRetries(
        () => instanceEventsClient.GetInstanceEvent(
            instanceOwnerPartyId,
            instanceGuid,
            eventGuid,
            labels,
        ),
        "GetInstanceEvent",
    );

    /** @type {InstanceEvent|null} */
    let event = null;

    const success = check(res, {
        "GetInstanceEvent - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return event;
    }

    check(res, {
        "GetInstanceEvent - body is valid": (r) => {
            try {
                event = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return event;
}
