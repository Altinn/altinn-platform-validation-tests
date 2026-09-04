import http from "k6/http";

import { URL } from "../../../common-imports.js";
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.EventsCreate.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/cloudevents+json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

        const params = {
            tags: {
                endpoint: this.FULL_PATH,
                name: this.FULL_PATH,
                action: TAGS.EventsGet.action,
            },
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: `Bearer ${token}`,
                Accept: "application/cloudevents+json",
            }),
        };

        if (alternativeSubject !== null) {
            params.headers["Altinn-AlternativeSubject"] =
                alternativeSubject;
        }

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === null || value === undefined) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.get(url.toString(), params);
    }
}

export {
    EventsClient,
};
