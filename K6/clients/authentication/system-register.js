import http from "k6/http";

import { URL } from "../../common-imports.js";
import { AccessPackage, RegisterSystemRequest, Right } from "./types.js";

const TAGS = {
    SystemRegisterGet: {
        action: "system-register-get",
    },
    SystemRegisterVendorGet: {
        action: "system-register-vendor-get",
    },
    SystemRegisterVendorCreate: {
        action: "system-register-vendor-create",
    },
    SystemRegisterVendorGetById: {
        action: "system-register-vendor-get-by-id",
    },
    SystemRegisterVendorUpdate: {
        action: "system-register-vendor-update",
    },
    SystemRegisterVendorDelete: {
        action: "system-register-vendor-delete",
    },
    SystemRegisterGetRightsFrontend: {
        action: "system-register-get-rights",
    },
    SystemRegisterGetAccessPackagesFrontend: {
        action: "system-register-get-access-packages",
    },
    SystemRegisterVendorUpdateRights: {
        action: "system-register-vendor-update-rights",
    },
    SystemRegisterVendorUpdateAccessPackages: {
        action: "system-register-vendor-update-access-packages",
    },
    SystemRegisterVendorGetChangeLog: {
        action: "system-register-vendor-get-change-log",
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterGet(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.SystemRegisterGet.action,
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorGet(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor`,
            name: `${this.FULL_PATH}/vendor`,
            action: TAGS.SystemRegisterVendorGet.action,
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorCreate(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor`,
            name: `${this.FULL_PATH}/vendor`,
            action: TAGS.SystemRegisterVendorCreate.action,
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorGetById(systemId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/{systemId}`,
            name: `${this.FULL_PATH}/vendor/{systemId}`,
            action: TAGS.SystemRegisterVendorGetById.action,
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorUpdate(systemId, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/{systemId}`,
            name: `${this.FULL_PATH}/vendor/{systemId}`,
            action: TAGS.SystemRegisterVendorUpdate.action,
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorDelete(systemId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/{systemId}`,
            name: `${this.FULL_PATH}/vendor/{systemId}`,
            action: TAGS.SystemRegisterVendorDelete.action,
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterGetRightsFrontend(systemId, useOldFormatForApp = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${systemId}/rights`);

        if (useOldFormatForApp !== null) {
            url.searchParams.set("useOldFormatForApp", String(useOldFormatForApp));
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/{systemId}`,
            name: `${this.FULL_PATH}/vendor/{systemId}`,
            action: TAGS.SystemRegisterGetRightsFrontend.action,
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
     * Retrieves default access packages for a system.
     *
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {string} systemId System identifier.
     * @param {boolean|null} useOldFormatForApp Whether to use old app format.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterGetAccessPackagesFrontend(
        systemId,
        useOldFormatForApp = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${systemId}/accesspackages`);

        if (useOldFormatForApp !== null) {
            url.searchParams.set("useOldFormatForApp", String(useOldFormatForApp));
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/{systemId}`,
            name: `${this.FULL_PATH}/vendor/{systemId}`,
            action: TAGS.SystemRegisterGetAccessPackagesFrontend.action,
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
     * Updates rights on a registered system.
     *
     * @param {string} systemId System identifier.
     * @param {Right[]} rights Rights.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorUpdateRights(systemId, rights, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}/rights`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/{systemId}/rights`,
            name: `${this.FULL_PATH}/vendor/{systemId}/rights`,
            action: TAGS.SystemRegisterVendorUpdateRights.action,
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorUpdateAccessPackages(
        systemId,
        accessPackages,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}/accesspackages`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/{systemId}/accesspackages`,
            name: `${this.FULL_PATH}/vendor/{systemId}/accesspackages`,
            action: TAGS.SystemRegisterVendorUpdateAccessPackages.action,
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorGetChangeLog(systemId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${systemId}/changelog`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/{systemId}/changelog`,
            name: `${this.FULL_PATH}/vendor/{systemId}/changelog`,
            action: TAGS.SystemRegisterVendorGetChangeLog.action,
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
