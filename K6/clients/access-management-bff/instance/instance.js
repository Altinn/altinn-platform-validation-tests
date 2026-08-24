import http from "k6/http";

import { InstanceRightsDelegationDto } from "../common/common.types.js";
import { CreateInstanceRightsQuery, DeleteInstanceDelegationQuery, GetInstanceDelegationCheckQuery, GetInstanceDelegationsQuery, GetInstanceRightsQuery, GetInstanceSimplifiedUsersQuery, UpdateInstanceRightsQuery } from "./instance.types.js";

const TAGS = {
    GetInstanceDelegations: {
        action: "get-instance-delegations",
    },
    DeleteInstanceDelegation: {
        action: "delete-instance-delegation",
    },
    GetInstanceDelegationCheck: {
        action: "get-instance-delegation-check",
    },
    CreateInstanceRights: {
        action: "create-instance-rights",
    },
    GetInstanceRights: {
        action: "get-instance-rights",
    },
    UpdateInstanceRights: {
        action: "update-instance-rights",
    },
    GetInstanceSimplifiedUsers: {
        action: "get-instance-simplified-users",
    },
};

/**
 * Client for the instance delegation endpoints of the Access Management BFF
 * API.
 */
class InstanceClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/instances";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the instances delegated between two parties.
     *
     * @param {GetInstanceDelegationsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetInstanceDelegationsQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceDelegations(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegation/instances`);

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
            endpoint: `${this.FULL_PATH}/delegation/instances`,
            name: `${this.FULL_PATH}/delegation/instances`,
            action: TAGS.GetInstanceDelegations.action,
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
     * Revokes a delegated instance.
     *
     * @param {DeleteInstanceDelegationQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteInstanceDelegationQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteInstanceDelegation(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegation/instances`);

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
            endpoint: `${this.FULL_PATH}/delegation/instances`,
            name: `${this.FULL_PATH}/delegation/instances`,
            action: TAGS.DeleteInstanceDelegation.action,
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
     * Checks which rights on an instance the authenticated user can delegate.
     *
     * @param {GetInstanceDelegationCheckQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetInstanceDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceDelegationCheck(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegationcheck`);

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
            endpoint: `${this.FULL_PATH}/delegationcheck`,
            name: `${this.FULL_PATH}/delegationcheck`,
            action: TAGS.GetInstanceDelegationCheck.action,
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
     * Delegates rights on an instance to a person.
     *
     * @param {CreateInstanceRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link CreateInstanceRightsQueryBuilder}.
     * @param {InstanceRightsDelegationDto|null} [body] The person and the rights
     * to delegate. Prefer using {@link InstanceRightsDelegationDtoBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateInstanceRights(query = null, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegation/instances/rights`);

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
            endpoint: `${this.FULL_PATH}/delegation/instances/rights`,
            name: `${this.FULL_PATH}/delegation/instances/rights`,
            action: TAGS.CreateInstanceRights.action,
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
     * Gets the rights a party holds on an instance.
     *
     * @param {GetInstanceRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetInstanceRightsQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceRights(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegation/instances/rights`);

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
            endpoint: `${this.FULL_PATH}/delegation/instances/rights`,
            name: `${this.FULL_PATH}/delegation/instances/rights`,
            action: TAGS.GetInstanceRights.action,
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
     * Replaces the rights a party holds on an instance.
     *
     * @param {UpdateInstanceRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link UpdateInstanceRightsQueryBuilder}.
     * @param {Array<string>|null} [body] Keys of the rights to keep.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateInstanceRights(query = null, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegation/instances/rights`);

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
            endpoint: `${this.FULL_PATH}/delegation/instances/rights`,
            name: `${this.FULL_PATH}/delegation/instances/rights`,
            action: TAGS.UpdateInstanceRights.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(
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
     * Gets the users an instance can be delegated to.
     *
     * @param {GetInstanceSimplifiedUsersQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetInstanceSimplifiedUsersQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceSimplifiedUsers(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/delegation/instances/simplified/users`,
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
            endpoint: `${this.FULL_PATH}/delegation/instances/simplified/users`,
            name: `${this.FULL_PATH}/delegation/instances/simplified/users`,
            action: TAGS.GetInstanceSimplifiedUsers.action,
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

export { InstanceClient };
