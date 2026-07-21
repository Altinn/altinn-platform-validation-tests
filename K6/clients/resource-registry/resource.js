import http from "k6/http";

const TAGS = {
    ResourceGetResourceList: {
        action: "resource-get-resource-list",
    },
    ResourceExport: {
        action: "resource-export",
    },
    ResourceGetResourceList: {
        action: "resource-get-resource-list",
    },
    ResourceExport: {
        action: "resource-export",
    },
    ResourceGetResource: {
        action: "resource-get-resource",
    },
    ResourceCreateResource: {
        action: "resource-create-resource",
    },
    ResourceUpdateResource: {
        action: "resource-update-resource",
    },
    ResourceDeleteResource: {
        action: "resource-delete-resource",
    },

    ResourceGetPolicy: {
        action: "resource-get-policy",
    },
    ResourceCreatePolicy: {
        action: "resource-create-policy",
    },
    ResourceUpdatePolicy: {
        action: "resource-update-policy",
    },
    ResourceGetPolicySubjects: {
        action: "resource-get-policy-subjects",
    },
    ResourceGetPolicyRules: {
        action: "resource-get-policy-rules",
    },
    ResourceGetPolicyRights: {
        action: "resource-get-policy-rights",
    },
    ResourceGetResourcesBySubjects: {
        action: "resource-get-resources-by-subjects",
    },
    ResourceSearch: {
        action: "resource-search",
    },








};

class ResourceClient {
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
        this.BASE_PATH = "/resourceregistry/api/v1/resource";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets all resources.
     *
     * @param {Object} [query] Optional query parameters.
     * @param {boolean} [query.includeApps]
     * @param {boolean} [query.includeAltinn2]
     * @param {boolean} [query.includeMigratedApps]
     * @param {{[key:string]:string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceGetResourceList(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/resourcelist`;

        if (query !== null) {
            const params = [];

            Object.keys(query).forEach((key) => {
                const value = query[key];

                if (value === undefined || value === null) {
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
            action: TAGS.ResourceGetResourceList.action,
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
     * Exports all resources as RDF/XML.
     *
     * @param {{[key:string]:string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceExport(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/export`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ResourceExport.action,
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
                Accept: "application/xml+rdf",
            },
        });
    }


    /**
     * Gets a single resource.
     *
     * @param {string} id Resource identifier.
     * @param {{versionId?: number}|Object} [query] Optional query parameters.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceGetResource(id, query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/${encodeURIComponent(id)}`;

        if (query !== null) {
            const params = [];

            Object.keys(query).forEach((key) => {
                const value = query[key];

                if (value === undefined || value === null) {
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
            action: TAGS.ResourceGetResource.action,
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
     * Creates a resource.
     *
     * @param {ServiceResource} resource Resource payload.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceCreateResource(resource, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ResourceCreateResource.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(resource), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    }


    /**
     * Updates a resource.
     *
     * @param {string} id Resource identifier.
     * @param {ServiceResource} resource Updated resource.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceUpdateResource(id, resource, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(id)}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ResourceUpdateResource.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, JSON.stringify(resource), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    }


    /**
     * Deletes a resource.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceDeleteResource(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(id)}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ResourceDeleteResource.action,
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
            },
        });
    }

    /**
     * Gets the XACML policy for a resource.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceGetPolicy(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(id)}/policy`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ResourceGetPolicy.action,
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
     * Creates or overwrites a resource policy.
     *
     * @param {string} id Resource identifier.
     * @param {*} policyFile XACML policy file created with http.file().
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceCreatePolicy(id, policyFile, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(id)}/policy`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ResourceCreatePolicy.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url,
            {
                policyFile,
            },
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Updates or overwrites a resource policy.
     *
     * @param {string} id Resource identifier.
     * @param {*} policyFile XACML policy file created with http.file().
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceUpdatePolicy(id, policyFile, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(id)}/policy`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ResourceUpdatePolicy.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(
            url,
            {
                policyFile,
            },
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }


    /**
     * Gets policy subjects.
     *
     * @param {string} id Resource identifier.
     * @param {{reloadFromXacml?: boolean}|Object} [query] Optional query parameters.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceGetPolicySubjects(id, query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/${encodeURIComponent(id)}/policy/subjects`;

        if (query !== null) {
            const params = [];

            Object.keys(query).forEach((key) => {
                const value = query[key];

                if (value === undefined || value === null) {
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
            action: TAGS.ResourceGetPolicySubjects.action,
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
     * Gets flattened policy rules for a resource.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     *
     * @returns {http.RefinedResponse}
     */
    ResourceGetPolicyRules(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${id}/policy/rules`;

        let tags = {
            endpoint: url,
            name: url,
            action: ResourceClient.TAGS.ResourceGetPolicyRules.action,
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
     * Gets rights from a resource policy.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     *
     * @returns {http.RefinedResponse}
     */
    ResourceGetPolicyRights(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${id}/policy/rights`;

        let tags = {
            endpoint: url,
            name: url,
            action: ResourceClient.TAGS.ResourceGetPolicyRights.action,
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
     * Gets resources connected to subjects.
     *
     * @param {Array<string>} subjects List of subjects for resource information.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     *
     * @returns {http.RefinedResponse}
     */
    ResourceGetResourcesBySubjects(subjects, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/bysubjects`;

        let tags = {
            endpoint: url,
            name: url,
            action: ResourceClient.TAGS.ResourceGetResourcesBySubjects.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(subjects), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Searches for resources in the resource registry.
     *
     * @param {ResourceSearchQueryBuilder|Object|null} [query]
     * Optional search query parameters.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     *
     * @returns {http.RefinedResponse}
     */
    ResourceSearch(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/Search`;

        if (query !== null) {
            const params = [];

            Object.keys(query).forEach((key) => {
                const value = query[key];

                if (value === undefined || value === null) {
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
            action: ResourceClient.TAGS.ResourceSearch.action,
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



}

export { ResourceClient };
