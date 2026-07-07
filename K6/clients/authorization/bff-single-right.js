import crypto from "k6/crypto";
import http from "k6/http";

const TAGS = {
    PostDelegate: { action: "post-delegate" },
    DeleteDelegate: { action: "delete-delegate" },
    GetDelegationCheck: { action: "get-delegation-check" },
};

class BffSingleRightApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at23.altinn.cloud
     * @param {*} tokenGenerator TODO: description
     */
    constructor(
        baseUrl,
        tokenGenerator,
    ) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1/singleright";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */

        this.FULL_PATH = baseUrl + this.BASE_PATH;

    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Post single right delegation
     *
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} resource - the resource for which the right is delegated, e.g. "ttd/altinn-app-frontend/tilgangstest/resource1"
     * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs., if null the url will be used as label
     * @returns http.RefinedResponse
     */

    PostDelegate(queryParams, rights, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegate`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.PostDelegate.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.post(url.toString(), JSON.stringify(rights), params);
    }

    /**
     * Delete single right delegation
     *
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs., if null the url will be used as label
     * @returns http.RefinedResponse
     */
    DeleteDelegate(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/revoke`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.DeleteDelegate.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.del(url.toString(), null, params);
    }

    /**
     * Get delegation check for a resource
     *
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs., if null the url will be used as label
     * @returns http.RefinedResponse
     */
    GetDelegationCheck(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegationcheck`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetDelegationCheck.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }
}

export { BffSingleRightApiClient };
