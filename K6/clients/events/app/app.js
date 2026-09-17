import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
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
        return http.post(
            this.FULL_PATH,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.AppCreate.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
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
        return http.get(
            buildUrl(`${this.FULL_PATH}/${org}/${app}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/{org}/{app}`,
                action: TAGS.AppGetByApp.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.get(
            buildUrl(`${this.FULL_PATH}/party`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/party`,
                action: TAGS.AppGetByParty.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { Person: person },
            }),
        );
    }
}

export {
    AppClient,
};
