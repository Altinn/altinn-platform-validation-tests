import http from "k6/http";

import { requestParams } from "../common/request.js";

const TAGS = {
    GetTextResource: {
        action: "get-text-resource",
    },
};

/**
 * Client for the Texts API. Read only: the swagger no longer lists the create,
 * update and delete operations, which are Studio Designer's and take a
 * platform token this repository does not have.
 */
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
        return http.get(
            `${this.FULL_PATH}/applications/${org}/${app}/texts/${language}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/applications/{org}/{app}/texts/{language}`,
                action: TAGS.GetTextResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { TextsClient };
