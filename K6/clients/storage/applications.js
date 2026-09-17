import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { Application } from "./applications.types.js";

const TAGS = {
    GetApplications: {
        action: "get-applications",
    },
    CreateApplication: {
        action: "create-application",
    },
    GetApplicationsByOrg: {
        action: "get-applications-by-org",
    },
    GetApplication: {
        action: "get-application",
    },
    UpdateApplication: {
        action: "update-application",
    },
    DeleteApplication: {
        action: "delete-application",
    },
};

class ApplicationsClient {
    /**
     * Creates a client for the Applications API.
     *
     * @param {string} baseUrl API base URL.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/storage/api/v1";

        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    /**
     * Default request tags used by the client.
     *
     * @returns {typeof TAGS} Default k6 tags.
     */
    static get TAGS() {
        return TAGS;
    }

    /**
     * Get all applications.
     *
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetApplications(labels = null) {
        return http.get(
            `${this.FULL_PATH}/applications`,
            requestParams({
                endpoint: `${this.FULL_PATH}/applications`,
                action: TAGS.GetApplications.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Create application metadata.
     *
     * @param {string|null} appId Application identifier.
     * @param {Application} application Application metadata.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateApplication(appId, application, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/applications`, { appId }),
            jsonBody(application),
            requestParams({
                endpoint: `${this.FULL_PATH}/applications`,
                action: TAGS.CreateApplication.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Get all applications for an organization.
     *
     * @param {string} org Organization identifier.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetApplicationsByOrg(org, labels = null) {
        return http.get(
            `${this.FULL_PATH}/applications/${org}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/applications/{org}`,
                action: TAGS.GetApplicationsByOrg.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get application metadata.
     *
     * @param {string} org Organization identifier.
     * @param {string} app Application identifier.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetApplication(org, app, labels = null) {
        return http.get(
            `${this.FULL_PATH}/applications/${org}/${app}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/applications/{org}/{app}`,
                action: TAGS.GetApplication.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Update application metadata.
     *
     * @param {string} org Organization identifier.
     * @param {string} app Application identifier.
     * @param {Application} application Application metadata.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateApplication(org, app, application, labels = null) {
        return http.put(
            `${this.FULL_PATH}/applications/${org}/${app}`,
            jsonBody(application),
            requestParams({
                endpoint: `${this.FULL_PATH}/applications/{org}/{app}`,
                action: TAGS.UpdateApplication.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Delete application metadata.
     *
     * @param {string} org Organization identifier.
     * @param {string} app Application identifier.
     * @param {boolean|null} hard Permanently delete.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteApplication(org, app, hard = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/applications/${org}/${app}`, { hard }),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/applications/{org}/{app}`,
                action: TAGS.DeleteApplication.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { ApplicationsClient };
