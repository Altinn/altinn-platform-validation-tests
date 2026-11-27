import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { ProcessNext } from "./app-api.types.js";

const TAGS = {
    NextElement: {
        action: "move-process-to-next-element",
    },
};

class ProcessClient {
    /**
     * Creates a client for the process API that every Altinn app has.
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
     * Moves the process of an instance on to the next element.
     *
     * PUT /{org}/{app}/instances/{instanceOwnerPartyId}/{instanceGuid}/process/next
     *
     * @param {string} org The service owner of the app.
     * @param {string} app The app name.
     * @param {string} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {ProcessNext|null} [processNext] Optional action to perform.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    NextElement(org, app, instanceOwnerPartyId, instanceGuid, processNext = null, labels = null) {
        return http.put(
            `${this.FULL_PATH}/${org}/${app}/instances/${instanceOwnerPartyId}/${instanceGuid}/process/next`,
            processNext === null ? null : jsonBody(processNext),
            requestParams({
                endpoint: `${this.FULL_PATH}/{org}/{app}/instances/{instanceOwnerPartyId}/{instanceGuid}/process/next`,
                action: TAGS.NextElement.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: processNext !== null,
            }),
        );
    }
}

export { ProcessClient };
