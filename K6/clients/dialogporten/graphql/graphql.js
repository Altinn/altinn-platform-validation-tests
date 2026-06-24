import http from "k6/http";
import { getAllDialogsForParties, getDialogById, getParties, getFilterServiceResources } from "./graphql-queries.js";
import { DialogSearchVariablesBuilder } from "./dialogs-search-variables-builder.js";
import { DialogByIdVariablesBuilder } from "./dialog-by-id-variables-builder.js";

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
     * Get all dialogs based on variables
     * @param {DialogSearchVariablesBuilder} variables - variables to use in the search query, built with DialogSearchVariablesBuilder
     * @param {string} label - a label to add to the request in k6
     * @returns response from the API
     */
    GetAllDialogsForParty(variables, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let tags = { endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
        };

        const query = getAllDialogsForParties(variables);
        return http.post(url.toString(), JSON.stringify(query), params);
    }

    /**
     * Get dialog by id
     * @param {DialogByIdVariablesBuilder} variables - the id of the dialog to get
     * @param {string} label - a label to add to the request in k6
     * @return response from the API
     */
    GetDialogById(variables, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let tags = { endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
        };
        const query = getDialogById(variables);
        return http.post(url.toString(), JSON.stringify(query), params);
    }

    /**
    * Get parties for a user
    *
    * @param {string} label - a label to add to the request in k6
    * @return response from the API
    * */
    GetParties(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let tags = { endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
        };
        const query = getParties();
        return http.post(url.toString(), JSON.stringify(query), params);
    }

    /**
     * Get filtered service resources for a user
     * @param {string} label - a label to add to the request in k6
     * @return response from the API
     */
    GetFilterServiceResources(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let tags = { endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
                "Accept-Language": "nb-NO",
            },
        };
        const query = getFilterServiceResources();
        return http.post(url.toString(), JSON.stringify(query), params);
    }
}

export { GraphqlClient };
