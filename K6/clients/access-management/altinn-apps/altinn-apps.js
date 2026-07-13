import http from "k6/http";

import {
    AppsInstanceDelegationRequestDto,
} from "./apps-instance-delegation.types.js";

const TAGS = {
    CheckResourceDelegation: {
        action: "check-resource-delegation",
    },
    CreateDelegation: {
        action: "create-delegation",
    },
    GetDelegations: {
        action: "get-delegations",
    },
    RevokeDelegation: {
        action: "revoke-delegation",
    },
    DeleteDelegations: {
        action: "delete-delegations",
    },
};

class AppsInstanceDelegationClient {
    /**
     * Creates a client for the Apps Instance Delegation API.
     *
     * @param {string} baseUrl API base URL.
     * @param {*} tokenGenerator Token generator used for authenticated requests.
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

    /**
     * Default request tags.
     *
     * @returns {object}
     */
    static get TAGS() {
        return TAGS;
    }

    /**
     * Checks whether rights may be delegated for an application instance.
     *
     * @param {string} resourceId Resource identifier.
     * @param {string} instanceId Instance identifier.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    CheckResourceDelegation(
        resourceId,
        instanceId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/app/delegationcheck/resource/${encodeURIComponent(resourceId)}/instance/${encodeURIComponent(instanceId)}`
        );

        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.CheckResourceDelegation.action,
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
            },
        });
    }

    /**
     * Creates one or more delegations for an application instance.
     *
     * @param {string} resourceId Resource identifier.
     * @param {string} instanceId Instance identifier.
     * @param {AppsInstanceDelegationRequestDto} request Delegation request.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    CreateDelegation(
        resourceId,
        instanceId,
        request,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/app/delegations/resource/${encodeURIComponent(resourceId)}/instance/${encodeURIComponent(instanceId)}`
        );

        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.CreateDelegation.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
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
     * Gets existing delegations for an application instance.
     *
     * @param {string} resourceId Resource identifier.
     * @param {string} instanceId Instance identifier.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    GetDelegations(
        resourceId,
        instanceId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/app/delegations/resource/${encodeURIComponent(resourceId)}/instance/${encodeURIComponent(instanceId)}`
        );

        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetDelegations.action,
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
            },
        });
    }

    /**
     * Revokes one or more delegations for an application instance.
     *
     * @param {string} resourceId Resource identifier.
     * @param {string} instanceId Instance identifier.
     * @param {AppsInstanceDelegationRequestDto} request Revoke request.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    RevokeDelegation(
        resourceId,
        instanceId,
        request,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/app/delegationrevoke/resource/${encodeURIComponent(resourceId)}/instance/${encodeURIComponent(instanceId)}`
        );

        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.RevokeDelegation.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
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
     * Deletes all delegations for an application instance.
     *
     * @param {string} resourceId Resource identifier.
     * @param {string} instanceId Instance identifier.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    DeleteDelegations(
        resourceId,
        instanceId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/app/delegationrevoke/resource/${encodeURIComponent(resourceId)}/instance/${encodeURIComponent(instanceId)}`
        );

        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.DeleteDelegations.action,
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
                },
            },
        );
    }
}

export { AppsInstanceDelegationClient };
