import http from "k6/http";
import { uuidv4 } from "../../../common-imports";

const TAGS = {
    GetDialogs: { action: "get-dialogs" },
};

class EnduserApiClient {
    /**
   *
   * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
   * @param {*} tokenGenerator
   */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;
        /**
     * @property {string} BASE_PATH The path to the api without host information
     */
        this.BASE_PATH = "/dialogporten/api/v1/enduser";
        /**
     * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
     */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
   * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/SearchDialogs
   * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/End/V1ServiceOwnerDialogsQueriesSearch_Dialog
   * @param  DialogSearchParamsBuilder - object containing query parameters for the request
   * @returns http.RefinedResponse
   */

    GetDialogs(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs");

        for (const [key, value] of Object.entries(queryParams)) {
            if (value === undefined || value === null) continue;
            if (Array.isArray(value)) {
                for (const item of value) {
                    url.searchParams.append(key, item);
                }
            } else {
                url.searchParams.append(key, value);
            }
        }

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs",
            name: this.FULL_PATH + "/dialogs",
            action: TAGS.GetDialogs.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                Accept: "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }
}
export { EnduserApiClient };
