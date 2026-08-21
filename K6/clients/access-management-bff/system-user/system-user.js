import http from "k6/http";

import { NewSystemUserRequest } from "../common/common.types.js";
import { DeleteAgentSystemUserQuery } from "./system-user.types.js";

const TAGS = {
    GetSystemUsers: {
        action: "get-system-users",
    },
    CreateSystemUser: {
        action: "create-system-user",
    },
    GetSystemUser: {
        action: "get-system-user",
    },
    DeleteSystemUser: {
        action: "delete-system-user",
    },
    GetAgentSystemUsers: {
        action: "get-agent-system-users",
    },
    GetAgentSystemUser: {
        action: "get-agent-system-user",
    },
    DeleteAgentSystemUser: {
        action: "delete-agent-system-user",
    },
    GetPendingSystemUsers: {
        action: "get-pending-system-users",
    },
};

/**
 * Client for the system user endpoints of the Access Management BFF API.
 */
class SystemUserClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/systemuser";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the system users of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSystemUsers(partyId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${partyId}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/{partyId}`,
            name: `${this.FULL_PATH}/{partyId}`,
            action: TAGS.GetSystemUsers.action,
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
     * Creates a system user for an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {NewSystemUserRequest|null} [body] The system user to create. Prefer
     * using {@link NewSystemUserRequestBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateSystemUser(partyId, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${partyId}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/{partyId}`,
            name: `${this.FULL_PATH}/{partyId}`,
            action: TAGS.CreateSystemUser.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets a single system user of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSystemUser(partyId, systemUserGuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${partyId}/${systemUserGuid}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}`,
            name: `${this.FULL_PATH}/{partyId}/{systemUserGuid}`,
            action: TAGS.GetSystemUser.action,
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
     * Deletes a system user of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteSystemUser(partyId, systemUserGuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${partyId}/${systemUserGuid}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}`,
            name: `${this.FULL_PATH}/{partyId}/{systemUserGuid}`,
            action: TAGS.DeleteSystemUser.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(
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
     * Gets the agent system users of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentSystemUsers(partyId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agent/${partyId}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/agent/{partyId}`,
            name: `${this.FULL_PATH}/agent/{partyId}`,
            action: TAGS.GetAgentSystemUsers.action,
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
     * Gets a single agent system user of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentSystemUser(partyId, systemUserGuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/agent/${partyId}/${systemUserGuid}`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/agent/{partyId}/{systemUserGuid}`,
            name: `${this.FULL_PATH}/agent/{partyId}/{systemUserGuid}`,
            action: TAGS.GetAgentSystemUser.action,
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
     * Deletes an agent system user of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {DeleteAgentSystemUserQuery|null} [query] Optional query parameters.
     * Prefer using {@link DeleteAgentSystemUserQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgentSystemUser(
        partyId,
        systemUserGuid,
        query = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/agent/${partyId}/${systemUserGuid}`,
        );

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/agent/{partyId}/{systemUserGuid}`,
            name: `${this.FULL_PATH}/agent/{partyId}/{systemUserGuid}`,
            action: TAGS.DeleteAgentSystemUser.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(
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
     * Gets the pending system user requests of an organisation.
     *
     * @param {string} partyUuid Party UUID of the organisation.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetPendingSystemUsers(partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${partyUuid}/pending`);

        let tags = {
            endpoint: `${this.FULL_PATH}/{partyUuid}/pending`,
            name: `${this.FULL_PATH}/{partyUuid}/pending`,
            action: TAGS.GetPendingSystemUsers.action,
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

export { SystemUserClient };
