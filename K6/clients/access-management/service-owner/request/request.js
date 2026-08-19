import http from "k6/http";

const TAGS = {
    RequestGetPartyUrns: {
        action: "request-get-party-urns",
    },
    RequestGetRequestStatus: {
        action: "request-get-request-status",
    },
    RequestWithdrawRequest: {
        action: "request-withdraw-request",
    },
    RequestCreateResourceRequest: {
        action: "request-create-resource-request",
    },
    RequestCreatePackageRequest: {
        action: "request-create-package-request",
    },
    RequestCreateRequest: {
        action: "request-create-request",
    },
};

class RequestClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/accessmanagement/api/v1/serviceowner/delegationrequests";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets supported party URN types.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestGetPartyUrns(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/_meta/urns/party`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.RequestGetPartyUrns.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets request status.
     *
     * @param {string} id Request identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestGetRequestStatus(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${id}/status`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}/status`,
            name: `${this.FULL_PATH}/{id}/status`,
            action: TAGS.RequestGetRequestStatus.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Withdraws a delegation request.
     *
     * @param {string} id Request identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestWithdrawRequest(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${id}/withdraw`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}/withdraw`,
            name: `${this.FULL_PATH}/{id}/withdraw`,
            action: TAGS.RequestWithdrawRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Creates a resource delegation request.
     *
     * @param {RequestResourceDto} request Request payload.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestCreateResourceRequest(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/resource`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.RequestCreateResourceRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Creates a package delegation request.
     *
     * @param {RequestPackageDto} request Request payload.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestCreatePackageRequest(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/package`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.RequestCreatePackageRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Creates a delegation request.
     *
     * @param {CreateServiceOwnerRequest} request Request payload.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestCreateRequest(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = this.FULL_PATH;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.RequestCreateRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }
}

export { RequestClient };
