import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
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
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateInstanceEvent(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/events`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/events`,
                action: TAGS.CreateInstanceEvent.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the events of an instance.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}/events
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {Array<string>|null} [eventTypes] Event types to include.
     * @param {string|null} [from] Only include events from this timestamp.
     * @param {string|null} [to] Only include events up to this timestamp.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceEvents(instanceOwnerPartyId, instanceGuid, eventTypes = null, from = null, to = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/events`, {
                eventTypes: eventTypes !== null ? eventTypes.join(",") : null,
                from,
                to,
            }),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/events`,
                action: TAGS.GetInstanceEvents.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets a single event of an instance.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}/events/{eventGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} eventGuid Event UUID.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceEvent(instanceOwnerPartyId, instanceGuid, eventGuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/events/${eventGuid}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/events/{eventGuid}`,
                action: TAGS.GetInstanceEvent.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { InstanceEventsClient };
