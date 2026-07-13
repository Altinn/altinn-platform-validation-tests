import http from "k6/http";

const TAGS = {
    InitializeServiceOwner: {
        action: "initialize-service-owner",
    },
    GetServiceOwner: {
        action: "get-service-owner",
    },
};

class ServiceOwnerClient {
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
        this.BASE_PATH = "/broker/api/v1/serviceowner";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Initializes the service owner for the calling organization within the broker service.
     *
     * @param {ServiceOwnerInitializeExt} request
     * Service owner initialization request.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} TODO description
     */
    InitializeServiceOwner(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.InitializeServiceOwner.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            this.FULL_PATH,
            JSON.stringify(request),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }

    /**
     * Gets the service owner for the calling organization within the broker service.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<ServiceOwnerOverviewExt>}
     * Service owner overview information.
     */
    GetServiceOwner(labels = null) {
        const token = this.tokenGenerator.getToken();

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetServiceOwner.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(
            this.FULL_PATH,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }
}

export { ServiceOwnerClient };
