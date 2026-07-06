import http from "k6/http";

const TAGS = {
    GetAccessPackagesExport: { action: "get-accesspackages-export" },
};

class MetaApiClient {
    /**
     * Client for the Access Management metadata API. These endpoints are public
     * (no authentication required), so no token generator is needed.
     *
     * @param {string} baseUrl e.g. https://platform.tt02.altinn.no
     */
    constructor(baseUrl) {
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1/meta";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Export the full access package catalogue (groups -> areas -> packages).
     * Docs {@link https://docs.altinn.studio/nb/api/accessmanagement/metadata/#/Meta/get_meta_info_accesspackages_export}
     *
     * @param {Object.<string, string>} labels - request labels for metrics
     * @returns http.RefinedResponse
     */
    GetAccessPackagesExport(labels = null) {
        const url = new URL(`${this.FULL_PATH}/info/accesspackages/export`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetAccessPackagesExport.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Accept: "application/json",
            },
        };
        return http.get(url.toString(), params);
    }
}

export { MetaApiClient };
