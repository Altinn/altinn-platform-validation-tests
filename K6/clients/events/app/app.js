import http from "k6/http";

const TAGS = {
    AppCreate: {
        action: "app-create",
    },
    AppGetByApp: {
        action: "app-get-by-app",
    },
    AppGetByParty: {
        action: "app-get-by-party",
    },
};

class AppClient {
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
        this.BASE_PATH = "/events/api/v1/app";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Inserts a new event.
     *
     * @param {AppCloudEventRequestModel} request Event payload.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    AppCreate(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.AppCreate.action,
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
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Retrieves events related to an application owner and application.
     *
     * @param {string} org Application owner acronym.
     * @param {string} app Application name.
     * @param {Object} [query] Optional query parameters.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    AppGetByApp(org, app, query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/${org}/${app}`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.AppGetByApp.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

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

    /**
     * Retrieves events related to a party.
     *
     * @param {Object} [query] Optional query parameters.
     * @param {string} [person] Person number header value.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    AppGetByParty(query = null, person = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/party`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.AppGetByParty.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        if (person !== null) {
            params.headers.Person = person;
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
    AppClient,
};
