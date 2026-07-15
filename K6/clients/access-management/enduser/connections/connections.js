import http from "k6/http";

const TAGS = {
    GetConnections: {
        action: "get-connections",
    },
    CreateConnection: {
        action: "create-connection",
    },
    DeleteConnection: {
        action: "delete-connection",
    },
    GetConnectionUsers: {
        action: "get-connection-users",
    },
    GetAccessPackages: {
        action: "get-access-packages",
    },
    CreateAccessPackage: {
        action: "create-access-package",
    },
    DeleteAccessPackage: {
        action: "delete-access-package",
    },
    GetAccessPackageDelegationCheck: {
        action: "get-access-package-delegation-check",
    },
};

class ConnectionsClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/enduser/connections";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets connections for a party.
     *
     * @param {GetConnectionsQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetConnectionsQueryBuilder}.
     * @param {{[key: string]: string|number}} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetConnections(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

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
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetConnections.action,
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
                ...headers,
            },
        });
    }

    /**
     * Creates a connection.
     *
     * @param {CreateConnectionQuery|null} [query]
     * Query parameters. Prefer using
     * {@link CreateConnectionQueryBuilder}.
     * @param {PersonInput|null} [body]
     * Request body.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    CreateConnection(
        query = null,
        body = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

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
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.CreateConnection.action,
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
                },
            },
        );
    }

    /**
     * Deletes a connection.
     *
     * @param {DeleteConnectionQuery|null} [query]
     * Query parameters. Prefer using
     * {@link DeleteConnectionQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    DeleteConnection(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

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
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.DeleteConnection.action,
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
            },
        });
    }
}

/**
 * Gets users connected to a party.
 *
 * @param {GetConnectionUsersQuery|null} [query]
 * Query parameters. Prefer using
 * {@link GetConnectionUsersQueryBuilder}.
 * @param {{[key: string]: string|number}} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {http.RefinedResponse}
 */
GetConnectionUsers(
    query = null,
    headers = {
        "X-Page-Size": 100,
        "X-Page-Number": 0,
    },
    labels = null,
) {
    const token = this.tokenGenerator.getToken();

    const url = new URL(`${this.FULL_PATH}/users`);

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
        endpoint: `${this.FULL_PATH}/users`,
        name: `${this.FULL_PATH}/users`,
        action: TAGS.GetConnectionUsers.action,
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
            ...headers,
        },
    });
}

/**
 * Gets access package permissions for connections.
 *
 * @param {GetAccessPackagesQuery|null} [query]
 * Query parameters. Prefer using
 * {@link GetAccessPackagesQueryBuilder}.
 * @param {{[key: string]: string|number}} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {http.RefinedResponse}
 */
GetAccessPackages(
    query = null,
    headers = {
        "X-Page-Size": 100,
        "X-Page-Number": 0,
    },
    labels = null,
) {
    const token = this.tokenGenerator.getToken();

    const url = new URL(`${this.FULL_PATH}/accesspackages`);

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
        endpoint: `${this.FULL_PATH}/accesspackages`,
        name: `${this.FULL_PATH}/accesspackages`,
        action: TAGS.GetAccessPackages.action,
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
            ...headers,
        },
    });
}

/**
 * Creates an access package assignment.
 *
 * @param {CreateAccessPackageQuery|null} [query]
 * Query parameters. Prefer using
 * {@link CreateAccessPackageQueryBuilder}.
 * @param {PersonInput|null} [body]
 * Request body.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {http.RefinedResponse}
 */
CreateAccessPackage(
    query = null,
    body = null,
    labels = null,
) {
    const token = this.tokenGenerator.getToken();

    const url = new URL(`${this.FULL_PATH}/accesspackages`);

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
        endpoint: `${this.FULL_PATH}/accesspackages`,
        name: `${this.FULL_PATH}/accesspackages`,
        action: TAGS.CreateAccessPackage.action,
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
            },
        },
    );
}

/**
 * Deletes an access package assignment.
 *
 * @param {DeleteAccessPackageQuery|null} [query]
 * Query parameters. Prefer using
 * {@link DeleteAccessPackageQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {http.RefinedResponse}
 */
DeleteAccessPackage(query = null, labels = null) {
    const token = this.tokenGenerator.getToken();

    const url = new URL(`${this.FULL_PATH}/accesspackages`);

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
        endpoint: `${this.FULL_PATH}/accesspackages`,
        name: `${this.FULL_PATH}/accesspackages`,
        action: TAGS.DeleteAccessPackage.action,
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
        },
    });
}

/**
 * Checks access package delegation.
 *
 * @param {AccessPackageDelegationCheckQuery|null} [query]
 * Query parameters. Prefer using
 * {@link AccessPackageDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {http.RefinedResponse}
 */
GetAccessPackageDelegationCheck(query = null, labels = null) {
    const token = this.tokenGenerator.getToken();

    const url = new URL(`${this.FULL_PATH}/accesspackages/delegationcheck`);

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
        endpoint: `${this.FULL_PATH}/accesspackages/delegationcheck`,
        name: `${this.FULL_PATH}/accesspackages/delegationcheck`,
        action: TAGS.GetAccessPackageDelegationCheck.action,
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


export { ConnectionsClient };
