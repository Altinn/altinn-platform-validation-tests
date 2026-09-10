/**
 * @typedef {import("./dialogs-search-variables-builder.js").DialogSearchVariables} DialogSearchVariables
 */
/**
 * @typedef {import("./dialog-by-id-variables-builder.js").DialogByIdVariables} DialogByIdVariables
 */
import http from "k6/http";

import { URL } from "../../../common-imports.js";
import { getAllDialogsForParties, getDialogById, getFilterServiceResources, getParties } from "./graphql-queries.js";

const TAGS = {
    GetAllDialogsForParty: { action: "get-all-dialogs-for-party" },
    GetDialogById: { action: "get-dialog-by-id" },
    GetParties: { action: "get-parties" },
    GetFilterServiceResources: { action: "get-filter-service-resources" },
};

class GraphqlClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator TODO: description
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

    static get TAGS() {
        return TAGS;
    }

    /**
     * Get all dialogs based on variables
     *
     * @param {DialogSearchVariables} variables - variables to use in the search query, built with DialogSearchVariablesBuilder
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns response from the API
     */
    GetAllDialogsForParty(variables, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetAllDialogsForParty.action
        };
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
     *
     * @param {DialogByIdVariables} variables - the variables naming the dialog to get
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns response from the API
     */
    GetDialogById(variables, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetDialogById.action
        };
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
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns response from the API
     * */
    GetParties(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetParties.action
        };
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
     *
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns response from the API
     */
    GetFilterServiceResources(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetFilterServiceResources.action
        };
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
