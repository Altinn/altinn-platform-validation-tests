import http from "k6/http";

import { ResourceListQuery, ResourceSearchQuery, ServiceResource, UpdatedResourceSubjectsQuery } from "./types.js";

const TAGS = {
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

    ResourceUpdated: {
        action: "resource-updated",
    },

};

class ResourceClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} [tokenGenerator] Generates bearer tokens. The public endpoints
     * are readable without one.
     */
    constructor(baseUrl, tokenGenerator = null) {
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
     * @param {ResourceListQuery|null} [query] Optional query parameters.
     * @param {{[key:string]:string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
            endpoint: `${this.FULL_PATH}/resourcelist`,
            name: `${this.FULL_PATH}/resourcelist`,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Exports all resources as RDF/XML.
     *
     * @param {{[key:string]:string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
     * @param {{versionId?: number} | object} [query] Optional query parameters.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
            endpoint: `${this.FULL_PATH}/{id}`,
            name: `${this.FULL_PATH}/{id}`,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Creates a resource.
     *
     * @param {ServiceResource} resource Resource payload.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Updates a resource.
     *
     * @param {string} id Resource identifier.
     * @param {ServiceResource} resource Updated resource.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceUpdateResource(id, resource, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(id)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}`,
            name: `${this.FULL_PATH}/{id}`,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Deletes a resource.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceDeleteResource(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(id)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}`,
            name: `${this.FULL_PATH}/{id}`,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets the XACML policy for a resource.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceGetPolicy(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(id)}/policy`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}/policy`,
            name: `${this.FULL_PATH}/{id}/policy`,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Creates or overwrites a resource policy.
     *
     * @param {string} id Resource identifier.
     * @param {*} policyFile XACML policy file created with http.file().
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceCreatePolicy(id, policyFile, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(id)}/policy`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}/policy`,
            name: `${this.FULL_PATH}/{id}/policy`,
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
                    Accept: "application/json",
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
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceUpdatePolicy(id, policyFile, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(id)}/policy`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}/policy`,
            name: `${this.FULL_PATH}/{id}/policy`,
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
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets policy subjects.
     *
     * @param {string} id Resource identifier.
     * @param {{reloadFromXacml?: boolean}|null} [query] Optional query parameters.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
            endpoint: `${this.FULL_PATH}/{id}/policy/subjects`,
            name: `${this.FULL_PATH}/{id}/policy/subjects`,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets flattened policy rules for a resource.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceGetPolicyRules(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${id}/policy/rules`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}/policy/rules`,
            name: `${this.FULL_PATH}/{id}/policy/rules`,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets rights from a resource policy.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceGetPolicyRights(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${id}/policy/rights`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}/policy/rights`,
            name: `${this.FULL_PATH}/{id}/policy/rights`,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets resources connected to subjects.
     *
     * @param {Array<string>} subjects List of subjects for resource information.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Searches for resources in the resource registry.
     *
     * @param {ResourceSearchQuery|null} [query] Query parameters.
     * Optional search query parameters.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
            endpoint: `${this.FULL_PATH}/Search`,
            name: `${this.FULL_PATH}/Search`,
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
                Accept: "application/json",
            },
        });
    }
    /**
     * Gets the updated resources since the provided last updated time.
     *
     * @param {UpdatedResourceSubjectsQuery|null} [query] Query parameters.
     * Optional query parameters.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceUpdated(query = null, labels = null) {
        // The endpoint is public, so the client may be built without a token
        // generator. That is what lets this run as a healthcheck in prod.
        const headers = { Accept: "application/json" };
        const token = this.tokenGenerator?.getToken();

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        let url = `${this.FULL_PATH}/updated`;

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
            endpoint: `${this.FULL_PATH}/updated`,
            // The query stays out of the name tag, or metrics get one series per value.
            name: `${this.FULL_PATH}/updated`,
            action: TAGS.ResourceUpdated.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers,
        });
    }

}

export { ResourceClient };
