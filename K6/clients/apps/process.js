import http from "k6/http";

import { requestParams } from "../common/request.js";

const TAGS = {
    NextElement: {
        action: "next-element",
    },
};

class ProcessClient {
    /**
     * Creates a client for the process API of an Altinn app.
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
     * Moves the process of an instance on to the next element, which submits the
     * instance when the current task is the last one.
     *
     * PUT /{org}/{app}/instances/{instanceOwnerPartyId}/{instanceGuid}/process/next
     *
     * @param {string} org The service owner of the app.
     * @param {string} app The app name.
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    NextElement(org, app, instanceOwnerPartyId, instanceGuid, labels = null) {
        return http.put(
            `${this.FULL_PATH}/${org}/${app}/instances/${instanceOwnerPartyId}/${instanceGuid}/process/next`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{org}/{app}/instances/{instanceOwnerPartyId}/{instanceGuid}/process/next`,
                action: TAGS.NextElement.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { ProcessClient };
