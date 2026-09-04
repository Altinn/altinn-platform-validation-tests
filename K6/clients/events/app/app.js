import http from "k6/http";

import { URL } from "../../../common-imports.js";
import { AppCloudEventRequestModel, AppEventsByAppQuery, AppPartyEventsQuery } from "../types.js";

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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AppCreate(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Retrieves events related to an application owner and application.
     *
     * @param {string} org Application owner acronym.
     * @param {string} app Application name.
     * @param {AppEventsByAppQuery|null} [query] Optional query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AppGetByApp(org, app, query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${org}/${app}`);

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/{org}/{app}`,
                name: `${this.FULL_PATH}/{org}/{app}`,
                action: TAGS.AppGetByApp.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        };

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

    /**
     * Retrieves events related to a party.
     *
     * @param {AppPartyEventsQuery|null} [query] Optional query parameters.
     * @param {string|null} [person] Person number header value.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AppGetByParty(query = null, person = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/party`);

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/party`,
                name: `${this.FULL_PATH}/party`,
                action: TAGS.AppGetByParty.action,
            },
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            }),
        };

        if (person !== null) {
            params.headers.Person = person;
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
    AppClient,
};
