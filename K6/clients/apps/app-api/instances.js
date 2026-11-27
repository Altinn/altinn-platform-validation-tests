import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { Instance } from "../../storage/instances.types.js";

const TAGS = {
    Post: {
        action: "create-instance",
    },
};

class InstancesClient {
    /**
     * Creates a client for the instances API that every Altinn app has.
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
     * Creates an instance of the app.
     *
     * POST /{org}/{app}/instances
     *
     * @param {string} org The service owner of the app.
     * @param {string} app The app name.
     * @param {Instance} instance The instance template, which names the instance owner.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    Post(org, app, instance, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${org}/${app}/instances`,
            jsonBody(instance),
            requestParams({
                endpoint: `${this.FULL_PATH}/{org}/{app}/instances`,
                action: TAGS.Post.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { InstancesClient };
