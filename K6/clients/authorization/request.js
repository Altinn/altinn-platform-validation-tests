import http from "k6/http";

const TAGS = {
    PostPackage: { action: "post-request-package" },
    GetReceived: { action: "get-request-received" },
    Approve: { action: "put-request-received-approve" },
    Reject: { action: "put-request-received-reject" },
};

class RequestApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator
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
        this.BASE_PATH = "/accessmanagement/api/v1/enduser/request";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Request an access package (Bruker A asks Bruker B for access).
     * All three parameters are required.
     * Docs {@link https://docs.altinn.studio/nb/api/accessmanagement/enduser/#/Request/post_enduser_request_package}
     * @param {string} from - the party making the request (the `party` query parameter), as a party uuid, e.g. "a3...-...-...-...-...". Bruker A.
     * @param {string} to - the party the request is directed to, as a party uuid. Bruker B.
     * @param {string} accessPackage - urn of the access package being requested, e.g. "urn:altinn:accesspackage:motorvognavgift".
     * @param {Object.<string, string>} labels - request labels for metrics
     * @returns http.RefinedResponse
     */
    PostPackage(from, to, accessPackage, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/package`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.PostPackage.action
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
        url.searchParams.append("party", from);
        url.searchParams.append("to", to);
        url.searchParams.append("package", accessPackage);
        return http.post(url.toString(), null, params);
    }

    /**
     * Get requests received by a party (Bruker B sees incoming requests).
     * Build `queryParams` with {@link ReceivedRequestsParamsBuilder}.
     * Docs {@link https://docs.altinn.studio/nb/api/accessmanagement/enduser/#/Request/get_enduser_request_received}
     * @param {import("./received-requests-params-builder.js").ReceivedRequestsParams} queryParams - required: party. optional: from, status, type
     * @param {Object.<string, string>} labels - request labels for metrics
     * @returns http.RefinedResponse
     */
    GetReceived(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/received`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetReceived.action
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
        return http.get(url.toString(), params);
    }

    /**
     * Approve a received request (Bruker B grants access).
     * Docs {@link https://docs.altinn.studio/nb/api/accessmanagement/enduser/#/Request/put_enduser_request_received_approve}
     * @param {string} party - the party whose received request is being approved (party uuid)
     * @param {string} id - the id of the request to approve
     * @param {string[]} body - list of references to approve (empty list approves the request as is)
     * @param {Object.<string, string>} labels - request labels for metrics
     * @returns http.RefinedResponse
     */
    Approve(party, id, body = [], labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/received/approve`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.Approve.action
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
        url.searchParams.append("party", party);
        url.searchParams.append("id", id);
        return http.put(url.toString(), JSON.stringify(body), params);
    }

    /**
     * Reject a received request (Bruker B declines access).
     * Docs {@link https://docs.altinn.studio/nb/api/accessmanagement/enduser/#/Request/put_enduser_request_received_reject}
     * @param {string} party - the party whose received request is being rejected (party uuid)
     * @param {string} id - the id of the request to reject
     * @param {Object.<string, string>} labels - request labels for metrics
     * @returns http.RefinedResponse
     */
    Reject(party, id, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/received/reject`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.Reject.action
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
        url.searchParams.append("party", party);
        url.searchParams.append("id", id);
        return http.put(url.toString(), null, params);
    }
}

export { RequestApiClient };
