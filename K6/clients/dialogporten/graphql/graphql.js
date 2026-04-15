import http from "k6/http";
import { getAllDialogsForParty, getDialogById } from "./graphql-queries.js";

class GraphqlClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(
        baseUrl,
        tokenGenerator
    ) {
        /**
        * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
        */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/dialogporten/graphql";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    /**
     * Get all dialogs for party
     * @param {string} partyId - either a pid/ssn (11 digits) or an org number (9 digits)
     * @param {string} label - a label to add to the request in k6
     * @returns response from the API
     */
    GetAllDialogsForParty(partyId, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let nameTag = label ? label : this.FULL_PATH;
        const params = {
            tags: { name: nameTag, endpoint: url.toString() },
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
        };
        const query = getAllDialogsForParty(partyId);
        return http.post(url.toString(), JSON.stringify(query), params);
    }

    /**
     * Get dialog by id
     * @param {uuidv7} dialogId - the id of the dialog to get
     * @param {string} label - a label to add to the request in k6
     * @return response from the API
     */
    GetDialogById(dialogId, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let nameTag = label ? label : this.FULL_PATH;
        const params = {
            tags: { name: nameTag, endpoint: url.toString() },
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
        };
        const query = getDialogById(dialogId);
        return http.post(url.toString(), JSON.stringify(query), params);
    }
}

export { GraphqlClient };
