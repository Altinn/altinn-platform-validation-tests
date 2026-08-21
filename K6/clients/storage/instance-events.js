import http from "k6/http";

import { InstanceEvent } from "./instances.types.js";

const TAGS = {
    CreateInstanceEvent: {
        action: "create-instance-event",
    },
    GetInstanceEvents: {
        action: "get-instance-events",
    },
    GetInstanceEvent: {
        action: "get-instance-event",
    },
};

class InstanceEventsClient {
    /**
     * Creates a client for the Instance Events API.
     *
     * @param {string} baseUrl API base URL.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/storage/api/v1";

        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Adds an event to an instance.
     *
     * POST /instances/{instanceOwnerPartyId}/{instanceGuid}/events
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {InstanceEvent} request Event to store.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateInstanceEvent(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/events`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/events`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/events`,
            action: TAGS.CreateInstanceEvent.action,
        };

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Gets the events of an instance.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}/events
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {Array<string>} eventTypes Event types to include.
     * @param {string} from Only include events from this timestamp.
     * @param {string} to Only include events up to this timestamp.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceEvents(instanceOwnerPartyId, instanceGuid, eventTypes = null, from = null, to = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/events`);

        if (eventTypes !== null) {
            url.searchParams.append("eventTypes", eventTypes.join(","));
        }

        if (from !== null) {
            url.searchParams.append("from", from);
        }

        if (to !== null) {
            url.searchParams.append("to", to);
        }

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/events`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/events`,
            action: TAGS.GetInstanceEvents.action,
        };

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets a single event of an instance.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}/events/{eventGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} eventGuid Event UUID.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceEvent(instanceOwnerPartyId, instanceGuid, eventGuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/events/${eventGuid}`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/events/{eventGuid}`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/events/{eventGuid}`,
            action: TAGS.GetInstanceEvent.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { InstanceEventsClient };
