import http from "k6/http";

const TAGS = {
    SignInstance: {
        action: "sign-instance",
    },
};

class SignClient {
    /**
     * Creates a client for the Sign API.
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
     * Creates a signature for data elements of an instance.
     *
     * POST /instances/{instanceOwnerPartyId}/{instanceGuid}/sign
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {SignRequest} request Signature request.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    SignInstance(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/sign`;

        const tags = {
            ...labels,
            endpoint: url,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/sign`,
            action: TAGS.SignInstance.action,
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
}

export { SignClient };
