import http from "k6/http";

import { URL } from "../../../common-imports.js";
import { DelegateSingleRightsQuery, GetResourceDelegationsQuery, GetResourceRightsQuery, GetRightsMetaQuery, GetSingleRightDelegationCheckQuery, RevokeSingleRightsQuery, UpdateSingleRightsQuery } from "./single-right.types.js";

const TAGS = {
    GetSingleRightDelegationCheck: {
        action: "get-single-right-delegation-check",
    },
    GetRightsMeta: {
        action: "get-rights-meta",
    },
    DelegateSingleRights: {
        action: "delegate-single-rights",
    },
    GetResourceDelegations: {
        action: "get-resource-delegations",
    },
    GetResourceRights: {
        action: "get-resource-rights",
    },
    RevokeSingleRights: {
        action: "revoke-single-rights",
    },
    UpdateSingleRights: {
        action: "update-single-rights",
    },
};

/**
 * Client for the single right endpoints of the Access Management BFF API.
 */
class SingleRightClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/singleright";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Checks which rights on a resource the authenticated user can delegate.
     *
     * @param {GetSingleRightDelegationCheckQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetSingleRightDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSingleRightDelegationCheck(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegationcheck`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/delegationcheck`,
            name: `${this.FULL_PATH}/delegationcheck`,
            action: TAGS.GetSingleRightDelegationCheck.action,
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
     * Gets the rights a resource defines.
     *
     * @param {GetRightsMetaQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetRightsMetaQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRightsMeta(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/rightsmeta`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/rightsmeta`,
            name: `${this.FULL_PATH}/rightsmeta`,
            action: TAGS.GetRightsMeta.action,
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
     * Delegates rights on a resource to a party.
     *
     * @param {DelegateSingleRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link DelegateSingleRightsQueryBuilder}.
     * @param {Array<string>|null} [body] Keys of the rights to delegate.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DelegateSingleRights(query = null, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegate`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/delegate`,
            name: `${this.FULL_PATH}/delegate`,
            action: TAGS.DelegateSingleRights.action,
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
     * Gets the resources delegated between two parties.
     *
     * @param {GetResourceDelegationsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetResourceDelegationsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResourceDelegations(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegation/resources`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/delegation/resources`,
            name: `${this.FULL_PATH}/delegation/resources`,
            action: TAGS.GetResourceDelegations.action,
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
     * Gets the rights a party holds on a resource.
     *
     * @param {GetResourceRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetResourceRightsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResourceRights(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegation/resources/rights`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/delegation/resources/rights`,
            name: `${this.FULL_PATH}/delegation/resources/rights`,
            action: TAGS.GetResourceRights.action,
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
     * Revokes all rights a party holds on a resource.
     *
     * @param {RevokeSingleRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link RevokeSingleRightsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RevokeSingleRights(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/revoke`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/revoke`,
            name: `${this.FULL_PATH}/revoke`,
            action: TAGS.RevokeSingleRights.action,
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
     * Replaces the rights a party holds on a resource.
     *
     * @param {UpdateSingleRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link UpdateSingleRightsQueryBuilder}.
     * @param {Array<string>|null} [body] Keys of the rights to keep.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateSingleRights(query = null, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/update`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/update`,
            name: `${this.FULL_PATH}/update`,
            action: TAGS.UpdateSingleRights.action,
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
}

export { SingleRightClient };
