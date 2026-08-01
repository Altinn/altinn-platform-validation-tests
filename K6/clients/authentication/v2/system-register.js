import http from "k6/http";

const TAGS = {
    GetListOfRegisteredSystems: {
        action: "get-list-of-registered-systems",
    },
    GetListOfRegisteredSystemsForVendor: {
        action: "get-list-of-registered-systems-for-vendor",
    },
    CreateRegisteredSystem: {
        action: "create-registered-system",
    },
    GetRegisteredSystemInfo: {
        action: "get-registered-system-info",
    },
    UpdateWholeRegisteredSystem: {
        action: "update-whole-registered-system",
    },
    SetDeleteOnRegisteredSystem: {
        action: "set-delete-on-registered-system",
    },
    GetRightsForRegisteredSystem: {
        action: "get-list-of-registered-systems-rights",
    },
    GetAccessPackagesForRegisteredSystem: {
        action: "get-list-of-registered-systems-access-packages",
    },
    UpdateRightsOnRegisteredSystem: {
        action: "update-rights-on-registered-system",
    },
    UpdateAccessPackagesOnRegisteredSystem: {
        action: "update-access-packages-on-registered-system",
    },
    GetChangeLog: {
        action: "get-change-log",
    },
};

class SystemRegisterClient {
    /**
     * @param {string} baseUrl Base URL.
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
        this.BASE_PATH = "/authentication/api/v1/systemregister";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Retrieves all registered systems.
     *
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetListOfRegisteredSystems(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.GetListOfRegisteredSystems.action,
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
     * Retrieves all vendor registered systems.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetListOfRegisteredSystemsForVendor(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.GetListOfRegisteredSystemsForVendor.action,
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
     * Creates a new registered system.
     *
     * @param {RegisterSystemRequest} request System registration request.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreateRegisteredSystem(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.CreateRegisteredSystem.action,
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
     * Retrieves a registered system by id.
     *
     * @param {string} systemId System identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetRegisteredSystemInfo(systemId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/vendor/{systemId}`,
            action: TAGS.GetRegisteredSystemInfo.action,
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
     * Updates a registered system.
     *
     * @param {string} systemId System identifier.
     * @param {RegisterSystemRequest} request Updated system model.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UpdateWholeRegisteredSystem(systemId, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/vendor/{systemId}`,
            action: TAGS.UpdateWholeRegisteredSystem.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Deletes a registered system.
     *
     * @param {string} systemId System identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    SetDeleteOnRegisteredSystem(systemId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/vendor/{systemId}`,
            action: TAGS.SetDeleteOnRegisteredSystem.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Retrieves default rights for a system.
     *
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {string} systemId System identifier.
     * @param {boolean|null} useOldFormatForApp Whether to use old app format.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetRightsForRegisteredSystem(systemId, useOldFormatForApp = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/${systemId}/rights`;

        if (useOldFormatForApp !== null) {
            url += `?useOldFormatForApp=${encodeURIComponent(useOldFormatForApp)}`;
        }

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/vendor/{systemId}`,
            action: TAGS.GetRightsForRegisteredSystem.action,
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
     * Retrieves default access packages for a system.
     *
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {string} systemId System identifier.
     * @param {boolean|null} useOldFormatForApp Whether to use old app format.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetAccessPackagesForRegisteredSystem(
        systemId,
        useOldFormatForApp = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/${systemId}/accesspackages`;

        if (useOldFormatForApp !== null) {
            url += `?useOldFormatForApp=${encodeURIComponent(useOldFormatForApp)}`;
        }

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/vendor/{systemId}`,
            action: TAGS.GetAccessPackagesForRegisteredSystem.action,
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
     * Updates rights on a registered system.
     *
     * @param {string} systemId System identifier.
     * @param {Right[]} rights Rights.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UpdateRightsOnRegisteredSystem(systemId, rights, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}/rights`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/vendor/{systemId}/rights`,
            action: TAGS.UpdateRightsOnRegisteredSystem.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, JSON.stringify(rights), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Updates access packages on a registered system.
     *
     * @param {string} systemId System identifier.
     * @param {AccessPackage[]} accessPackages Access packages.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UpdateAccessPackagesOnRegisteredSystem(
        systemId,
        accessPackages,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}/accesspackages`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/vendor/{systemId}/accesspackages`,
            action: TAGS.UpdateAccessPackagesOnRegisteredSystem.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, JSON.stringify(accessPackages), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Retrieves system change log.
     *
     * @param {string} systemId System identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetChangeLog(systemId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}/changelog`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/vendor/{systemId}/changelog`,
            action: TAGS.GetChangeLog.action,
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
}

export {
    SystemRegisterClient,
};
