import http from "k6/http";

import { jsonBody, requestParams } from "../common/request.js";
import { InstansiationInstance } from "./apps.types.js";

const TAGS = {
    PostSimplified: {
        action: "post-simplified",
    },
};

class InstancesClient {
    /**
     * Creates a client for the instances API of an Altinn app.
     *
     * @param {string} baseUrl The apps host of the service owner, e.g. https://ttd.apps.tt02.altinn.no.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * @property {string} FULL_PATH The apps host, since every path starts with the org and app.
         */
        this.FULL_PATH = baseUrl;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates an instance from a simplified instance template, with optional prefill.
     *
     * POST /{org}/{app}/instances/create
     *
     * @param {string} org The service owner of the app.
     * @param {string} app The app name.
     * @param {InstansiationInstance} request The instance owner, and what to prefill.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PostSimplified(org, app, request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${org}/${app}/instances/create`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/{org}/{app}/instances/create`,
                action: TAGS.PostSimplified.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { InstancesClient };
