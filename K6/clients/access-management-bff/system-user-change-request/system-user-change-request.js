import http from "k6/http";

const TAGS = {
    GetChangeRequestByRequestId: {
        action: "get-change-request",
    },
    ApproveSystemUserChangeRequest: {
        action: "approve-change-request",
    },
    RejectSystemUserChangeRequest: {
        action: "reject-change-request",
    },
    Logout: {
        action: "get-change-request-logout",
    },
};

/**
 * Client for the system user change request endpoints of the Access Management
 * BFF API.
 */
class SystemUserChangeRequestClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/systemuser/changerequest";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets a system user change request.
     *
     * @param {string} changeRequestId Change request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetChangeRequestByRequestId(changeRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${changeRequestId}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/${changeRequestId}`,
            name: `${this.FULL_PATH}/{changeRequestId}`,
            action: TAGS.GetChangeRequestByRequestId.action,
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
     * Approves a system user change request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} changeRequestId Change request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ApproveSystemUserChangeRequest(partyId, changeRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/${partyId}/${changeRequestId}/approve`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/${partyId}/${changeRequestId}/approve`,
            name: `${this.FULL_PATH}/{partyId}/{changeRequestId}/approve`,
            action: TAGS.ApproveSystemUserChangeRequest.action,
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
     * Rejects a system user change request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} changeRequestId Change request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RejectSystemUserChangeRequest(partyId, changeRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/${partyId}/${changeRequestId}/reject`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/${partyId}/${changeRequestId}/reject`,
            name: `${this.FULL_PATH}/{partyId}/{changeRequestId}/reject`,
            action: TAGS.RejectSystemUserChangeRequest.action,
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
     * Gets the logout redirect for a system user change request.
     *
     * @param {string} changeRequestId Change request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    Logout(changeRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${changeRequestId}/logout`);

        let tags = {
            endpoint: `${this.FULL_PATH}/${changeRequestId}/logout`,
            name: `${this.FULL_PATH}/{changeRequestId}/logout`,
            action: TAGS.Logout.action,
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

export { SystemUserChangeRequestClient };
