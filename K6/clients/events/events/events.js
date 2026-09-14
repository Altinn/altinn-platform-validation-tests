import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
import { CloudEvent, EventsQueryParams } from "../types.js";

const TAGS = {
    EventsCreate: {
        action: "events-create",
    },
    EventsGet: {
        action: "events-get",
    },
};

class EventsClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/events";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Posts a new CloudEvent.
     *
     * @param {CloudEvent} request CloudEvent payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    EventsCreate(request, labels = null) {
        return http.post(
            this.FULL_PATH,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.EventsCreate.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
                headers: { "Content-Type": "application/cloudevents+json" },
            }),
        );
    }

    /**
     * Retrieves cloud events based on query parameters.
     *
     * @param {EventsQueryParams|null} [query]
     * Optional event filters.
     * @param {string|null} [alternativeSubject]
     * Alternative subject header value.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    EventsGet(query = null, alternativeSubject = null, labels = null) {
        return http.get(
            buildUrl(this.FULL_PATH, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.EventsGet.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: "application/cloudevents+json",
                headers: { "Altinn-AlternativeSubject": alternativeSubject },
            }),
        );
    }
}

export {
    EventsClient,
};
