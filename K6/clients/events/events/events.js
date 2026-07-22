import http from "k6/http";

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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     *
     * @returns {http.RefinedResponse}
     */
    EventsCreate(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: url,
            name: url,
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
     * @param {EventsQueryParams} [query]
     * Optional event filters.
     *
     * @param {string} [alternativeSubject]
     * Alternative subject header value.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     *
     * @returns {http.RefinedResponse}
     */
    EventsGet(query = null, alternativeSubject = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.EventsGet.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/cloudevents+json",
            },
        };

        if (alternativeSubject !== null) {
            params.headers["Altinn-AlternativeSubject"] =
                alternativeSubject;
        }

        if (query !== null) {
            const queryParams = [];

            Object.entries(query).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    return;
                }

                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        queryParams.push(
                            `${key}=${encodeURIComponent(item)}`,
                        );
                    });

                    return;
                }

                queryParams.push(
                    `${key}=${encodeURIComponent(value)}`,
                );
            });

            if (queryParams.length > 0) {
                url = `${url}?${queryParams.join("&")}`;
            }
        }

        params.tags.endpoint = url;
        params.tags.name = url;

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.get(url, params);
    }
}

export {
    EventsClient,
};
