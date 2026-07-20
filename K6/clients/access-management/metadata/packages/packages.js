import http from "k6/http";

const TAGS = {
    PackagesSearch: {
        action: "packages-search",
    },
    PackagesExport: {
        action: "packages-export",
    },
    PackagesGetGroup: {
        action: "packages-get-group",
    },
    PackagesGetGroupById: {
        action: "packages-get-group-by-id",
    },
    PackagesGetGroupAreasById: {
        action: "packages-get-group-areas-by-id",
    },
    PackagesGetAreaById: {
        action: "packages-get-area-by-id",
    },
    PackagesGetAreaPackagesById: {
        action: "packages-get-area-packages-by-id",
    },
    PackagesGetPackageById: {
        action: "packages-get-package-by-id",
    },
    PackagesGetPackageByUrn: {
        action: "packages-get-package-by-urn",
    },
    PackagesGetPackageResourcesById: {
        action: "packages-get-package-resources-by-id",
    },
};

class PackagesClient {
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
     * Searches access packages.
     *
     * @param {PackagesSearchQueryBuilder|Object} query Query parameters.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PackagesSearch(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/meta/info/accesspackages/search`;

        if (query !== null) {
            const params = [];

            Object.keys(query).forEach((key) => {
                const value = query[key];

                if (value === undefined || value === null) {
                    return;
                }

                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        params.push(
                            `${encodeURIComponent(key)}=${encodeURIComponent(item)}`,
                        );
                    });

                    return;
                }

                params.push(
                    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
                );
            });

            if (params.length > 0) {
                url = `${url}?${params.join("&")}`;
            }
        }

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.PackagesSearch.action,
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
            },
        });
    }

    /**
     * Exports access packages.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PackagesExport(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/accesspackages/export`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.PackagesExport.action,
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
            },
        });
    }

    /**
     * Gets access package group.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PackagesGetGroup(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/accesspackages/group`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.PackagesGetGroup.action,
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
            },
        });
    }

    /**
     * Gets access package group by id.
     *
     * @param {string} id Group identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PackagesGetGroupById(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/accesspackages/group/${id}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.PackagesGetGroupById.action,
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
            },
        });
    }

    /**
     * Gets areas for an access package group.
     *
     * @param {string} id Group identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PackagesGetGroupAreasById(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/accesspackages/group/${id}/areas`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.PackagesGetGroupAreasById.action,
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
            },
        });
    }

    /**
     * Gets area by id.
     *
     * @param {string} id Area identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PackagesGetAreaById(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/accesspackages/area/${id}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.PackagesGetAreaById.action,
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
            },
        });
    }

    /**
     * Gets packages for an area.
     *
     * @param {string} id Area identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PackagesGetAreaPackagesById(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/accesspackages/area/${id}/packages`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.PackagesGetAreaPackagesById.action,
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
            },
        });
    }

    /**
     * Gets package by id.
     *
     * @param {string} id Package identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PackagesGetPackageById(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/accesspackages/package/${id}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.PackagesGetPackageById.action,
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
            },
        });
    }

    /**
     * Gets package by URN.
     *
     * @param {string} urnValue Package URN.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PackagesGetPackageByUrn(urnValue, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/accesspackages/package/urn/${urnValue}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.PackagesGetPackageByUrn.action,
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
            },
        });
    }

    /**
     * Gets resources for a package.
     *
     * @param {string} id Package identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PackagesGetPackageResourcesById(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/accesspackages/package/${id}/resources`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.PackagesGetPackageResourcesById.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers:
            {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}

export { PackagesClient };
