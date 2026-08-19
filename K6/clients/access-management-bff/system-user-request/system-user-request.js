import http from "k6/http";

const TAGS = {
    GetSystemUserRequest: {
        action: "get-system-user-request",
    },
    ApproveSystemUserRequest: {
        action: "approve-system-user-request",
    },
    RejectSystemUserRequest: {
        action: "reject-system-user-request",
    },
    EscalateSystemUserRequest: {
        action: "escalate-system-user-request",
    },
    GetSystemUserRequestLogout: {
        action: "get-system-user-request-logout",
    },
};

/**
 * Client for the system user request endpoints of the Access Management BFF
 * API.
 */
class SystemUserRequestClient {
    /**
     * @param {string} baseUrl Base URL of the host serving the Access Management
     * frontend.
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
        this.BASE_PATH = "/accessmanagement/api/v1/systemuser/request";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets a system user request.
     *
     * @param {string} requestId System user request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetSystemUserRequest(requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${requestId}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/{requestId}`,
            name: `${this.FULL_PATH}/{requestId}`,
            action: TAGS.GetSystemUserRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Approves a system user request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} requestId System user request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ApproveSystemUserRequest(partyId, requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/${partyId}/${requestId}/approve`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/{partyId}/{requestId}/approve`,
            name: `${this.FULL_PATH}/{partyId}/{requestId}/approve`,
            action: TAGS.ApproveSystemUserRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Rejects a system user request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} requestId System user request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RejectSystemUserRequest(partyId, requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/${partyId}/${requestId}/reject`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/{partyId}/{requestId}/reject`,
            name: `${this.FULL_PATH}/{partyId}/{requestId}/reject`,
            action: TAGS.RejectSystemUserRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Escalates a system user request to someone who can approve it.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} requestId System user request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    EscalateSystemUserRequest(partyId, requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/${partyId}/${requestId}/escalate`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/{partyId}/{requestId}/escalate`,
            name: `${this.FULL_PATH}/{partyId}/{requestId}/escalate`,
            action: TAGS.EscalateSystemUserRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets the logout redirect for a system user request.
     *
     * @param {string} requestId System user request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetSystemUserRequestLogout(requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${requestId}/logout`);

        let tags = {
            endpoint: `${this.FULL_PATH}/{requestId}/logout`,
            name: `${this.FULL_PATH}/{requestId}/logout`,
            action: TAGS.GetSystemUserRequestLogout.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { SystemUserRequestClient };
