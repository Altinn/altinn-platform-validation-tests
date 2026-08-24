import http from "k6/http";

import { MaskinportenSupplierDelegationCheckQuery, MaskinportenSupplierResourcesQuery, MaskinportenSuppliersQuery } from "./maskinporten-suppliers.types.js";

const TAGS = {
    GetMaskinportenSuppliers: {
        action: "get-maskinporten-suppliers",
    },
    CreateMaskinportenSupplier: {
        action: "create-maskinporten-supplier",
    },
    DeleteMaskinportenSupplier: {
        action: "delete-maskinporten-supplier",
    },
    GetMaskinportenSupplierResources: {
        action: "get-maskinporten-supplier-resources",
    },
    CreateMaskinportenSupplierResource: {
        action: "create-maskinporten-supplier-resource",
    },
    DeleteMaskinportenSupplierResource: {
        action: "delete-maskinporten-supplier-resource",
    },
    GetMaskinportenSupplierDelegationCheck: {
        action: "get-maskinporten-supplier-delegation-check",
    },
};

class MaskinportenSuppliersClient {
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
        this.BASE_PATH =
            "/accessmanagement/api/v1/enduser/maskinportensuppliers";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Retrieves Maskinporten suppliers for a party.
     *
     * @param {MaskinportenSuppliersQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSuppliersQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMaskinportenSuppliers(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

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
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetMaskinportenSuppliers.action,
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
     * Creates a Maskinporten supplier connection.
     *
     * @param {MaskinportenSuppliersQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSuppliersQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateMaskinportenSupplier(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

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
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.CreateMaskinportenSupplier.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Deletes a Maskinporten supplier connection.
     *
     * @param {MaskinportenSuppliersQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSuppliersQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMaskinportenSupplier(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

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
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.DeleteMaskinportenSupplier.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Retrieves resource permissions for Maskinporten suppliers.
     *
     * @param {MaskinportenSupplierResourcesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSupplierResourcesQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMaskinportenSupplierResources(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/resources`);

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
            endpoint: `${this.FULL_PATH}/resources`,
            name: `${this.FULL_PATH}/resources`,
            action: TAGS.GetMaskinportenSupplierResources.action,
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
     * Creates a resource delegation for a Maskinporten supplier.
     *
     * @param {MaskinportenSupplierResourcesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSupplierResourcesQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateMaskinportenSupplierResource(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/resources`);

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
            endpoint: `${this.FULL_PATH}/resources`,
            name: `${this.FULL_PATH}/resources`,
            action: TAGS.CreateMaskinportenSupplierResource.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Deletes a resource delegation for a Maskinporten supplier.
     *
     * @param {MaskinportenSupplierResourcesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSupplierResourcesQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMaskinportenSupplierResource(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/resources`);

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
            endpoint: `${this.FULL_PATH}/resources`,
            name: `${this.FULL_PATH}/resources`,
            action: TAGS.DeleteMaskinportenSupplierResource.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Checks whether a Maskinporten supplier resource can be delegated.
     *
     * @param {MaskinportenSupplierDelegationCheckQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSupplierDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMaskinportenSupplierDelegationCheck(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/resources/delegationcheck`);

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
            endpoint: `${this.FULL_PATH}/resources/delegationcheck`,
            name: `${this.FULL_PATH}/resources/delegationcheck`,
            action: TAGS.GetMaskinportenSupplierDelegationCheck.action,
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

export { MaskinportenSuppliersClient };
