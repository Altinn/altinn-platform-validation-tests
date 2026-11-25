import http from "k6/http";

import { requestParams } from "../common/request.js";

const TAGS = {
    GetApplications: {
        action: "get-applications",
    },
    GetApplicationsByOrg: {
        action: "get-applications-by-org",
    },
    GetApplication: {
        action: "get-application",
    },
};

/**
 * Client for the Applications API. Read only: the swagger no longer lists the
 * create, update and delete operations, which are Studio Designer's and take a
 * platform token this repository does not have.
 */
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
}

export { ApplicationsClient };
