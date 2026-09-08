import http from "k6/http";

import { TextResource } from "./applications.types.js";

const TAGS = {
    CreateTextResource: {
        action: "create-text-resource",
    },
    GetTextResource: {
        action: "get-text-resource",
    },
    UpdateTextResource: {
        action: "update-text-resource",
    },
    DeleteTextResource: {
        action: "delete-text-resource",
    },
};

class TextsClient {
    /**
     * Creates a client for the Texts API.
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

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates a text resource for an application.
     *
     * POST /applications/{org}/{app}/texts
     *
     * @param {string} org Application owner, e.g. ttd.
     * @param {string} app Application name.
     * @param {TextResource} request Text resource to create.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateTextResource(org, app, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/applications/${org}/${app}/texts`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/applications/{org}/{app}/texts`,
            name: `${this.FULL_PATH}/applications/{org}/{app}/texts`,
            action: TAGS.CreateTextResource.action,
        };

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Gets a text resource for an application and language.
     *
     * GET /applications/{org}/{app}/texts/{language}
     *
     * @param {string} org Application owner, e.g. ttd.
     * @param {string} app Application name.
     * @param {string} language Language code, e.g. nb.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetTextResource(org, app, language, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/applications/${org}/${app}/texts/${language}`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/applications/{org}/{app}/texts/{language}`,
            name: `${this.FULL_PATH}/applications/{org}/{app}/texts/{language}`,
            action: TAGS.GetTextResource.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Replaces a text resource for an application and language.
     *
     * PUT /applications/{org}/{app}/texts/{language}
     *
     * @param {string} org Application owner, e.g. ttd.
     * @param {string} app Application name.
     * @param {string} language Language code, e.g. nb.
     * @param {TextResource} request Text resource to store.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateTextResource(org, app, language, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/applications/${org}/${app}/texts/${language}`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/applications/{org}/{app}/texts/{language}`,
            name: `${this.FULL_PATH}/applications/{org}/{app}/texts/{language}`,
            action: TAGS.UpdateTextResource.action,
        };

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Deletes a text resource for an application and language.
     *
     * DELETE /applications/{org}/{app}/texts/{language}
     *
     * @param {string} org Application owner, e.g. ttd.
     * @param {string} app Application name.
     * @param {string} language Language code, e.g. nb.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteTextResource(org, app, language, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/applications/${org}/${app}/texts/${language}`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/applications/{org}/{app}/texts/{language}`,
            name: `${this.FULL_PATH}/applications/{org}/{app}/texts/{language}`,
            action: TAGS.DeleteTextResource.action,
        };

        return http.del(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { TextsClient };
