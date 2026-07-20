import http from "k6/http";

const TAGS = {
    ConnectionsCreateAccessPackage: {
        action: "connections-create-access-package",
    },
    ConnectionsRevokeAccessPackage: {
        action: "connections-revoke-access-package",
    },
};

class ConnectionsClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates a service owner access package delegation.
     *
     * @param {ServiceOwnerAccessPackageDelegation} request Delegation payload.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ConnectionsCreateAccessPackage(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/serviceowner/connections/accesspackages`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ConnectionsCreateAccessPackage.action,
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
            },
        });
    }

    /**
     * Revokes a service owner access package delegation.
     *
     * @param {ServiceOwnerAccessPackageDelegation} request Delegation payload.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ConnectionsRevokeAccessPackage(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/serviceowner/connections/accesspackages/revoke`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ConnectionsRevokeAccessPackage.action,
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
            },
        });
    }
}

export { ConnectionsClient };
