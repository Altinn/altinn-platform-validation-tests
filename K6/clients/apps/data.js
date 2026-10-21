import http from "k6/http";

import { jsonBody, requestParams } from "../common/request.js";

const TAGS = {
    Put: {
        action: "put",
    },
};

class DataClient {
    /**
     * Creates a client for the data API of an Altinn app.
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
     * Replaces the content of a data element with the given form data.
     *
     * PUT /{org}/{app}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}
     *
     * @param {string} org The service owner of the app.
     * @param {string} app The app name.
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} dataGuid Data element UUID.
     * @param {{[key: string]: *}} formData The data model, as JSON.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    Put(org, app, instanceOwnerPartyId, instanceGuid, dataGuid, formData, labels = null) {
        return http.put(
            `${this.FULL_PATH}/${org}/${app}/instances/${instanceOwnerPartyId}/${instanceGuid}/data/${dataGuid}`,
            jsonBody(formData),
            requestParams({
                endpoint: `${this.FULL_PATH}/{org}/{app}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}`,
                action: TAGS.Put.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { DataClient };
