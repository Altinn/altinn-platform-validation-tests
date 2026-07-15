import http from "k6/http";

const TAGS = {
    GetReceivedRequests: {
        action: "get-received-requests",
    },
    GetReceivedRequestsCount: {
        action: "get-received-requests-count",
    },
    ApproveReceivedRequest: {
        action: "approve-received-request",
    },
    RejectReceivedRequest: {
        action: "reject-received-request",
    },
    CreateResourceRequest: {
        action: "create-resource-request",
    },
    CreatePackageRequest: {
        action: "create-package-request",
    },
    GetSentRequests: {
        action: "get-sent-requests",
    },
    GetSentRequestsCount: {
        action: "get-sent-requests-count",
    },
    WithdrawSentRequest: {
        action: "withdraw-sent-request",
    },
    GetRequest: {
        action: "get-request",
    },
    GetDraftRequest: {
        action: "get-draft-request",
    },
    ConfirmDraftRequest: {
        action: "confirm-draft-request",
    },
};

class RequestClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        this.tokenGenerator = tokenGenerator;

        this.BASE_PATH = "/accessmanagement/api/v1/enduser/request";

        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets received requests for a party.
     *
     * @param {ReceivedRequestsQuery|null} [query]
     * Query parameters. Prefer using {@link ReceivedRequestsQueryBuilder}.
     * @param {number|null} [pageSize]
     * Page size header.
     * @param {number|null} [pageNumber]
     * Page number header.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetReceivedRequests(
        query = null,
        pageSize = null,
        pageNumber = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/received`);

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
            endpoint: `${this.FULL_PATH}/received`,
            name: `${this.FULL_PATH}/received`,
            action: TAGS.GetReceivedRequests.action,
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
                ...(pageSize !== null && {
                    "X-Page-Size": pageSize,
                }),
                ...(pageNumber !== null && {
                    "X-Page-Number": pageNumber,
                }),
            },
        });
    }

    /**
     * Gets count of received requests for a party.
     *
     * @param {ReceivedRequestsQuery|null} [query]
     * Query parameters. Prefer using {@link ReceivedRequestsQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetReceivedRequestsCount(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/received/count`);

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
            endpoint: `${this.FULL_PATH}/received/count`,
            name: `${this.FULL_PATH}/received/count`,
            action: TAGS.GetReceivedRequestsCount.action,
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
 * Approves a received request.
 *
 * @param {string} party Party UUID.
 * @param {string} id Request UUID.
 * @param {Array<string>|null} [body]
 * Optional resource rights.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {http.RefinedResponse}
 */
    ApproveReceivedRequest(
        party,
        id,
        body = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/received/approve`);

        url.searchParams.append("party", party);
        url.searchParams.append("id", id);

        let tags = {
            endpoint: `${this.FULL_PATH}/received/approve`,
            name: `${this.FULL_PATH}/received/approve`,
            action: TAGS.ApproveReceivedRequest.action,
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
                },
            },
        );
    }

    /**
     * Rejects a received request.
     *
     * @param {string} party Party UUID.
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    RejectReceivedRequest(
        party,
        id,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/received/reject`);

        url.searchParams.append("party", party);
        url.searchParams.append("id", id);

        let tags = {
            endpoint: `${this.FULL_PATH}/received/reject`,
            name: `${this.FULL_PATH}/received/reject`,
            action: TAGS.RejectReceivedRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Creates a resource request.
     *
     * @param {string} party Party UUID.
     * @param {string} to Party UUID.
     * @param {string} resource Resource identifier.
     * @param {Array<string>|null} [body]
     * Optional rights.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    CreateResourceRequest(
        party,
        to,
        resource,
        body = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/resource`);

        url.searchParams.append("party", party);
        url.searchParams.append("to", to);
        url.searchParams.append("resource", resource);

        let tags = {
            endpoint: `${this.FULL_PATH}/resource`,
            name: `${this.FULL_PATH}/resource`,
            action: TAGS.CreateResourceRequest.action,
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
     * Creates a package request.
     *
     * @param {string} party Party UUID.
     * @param {string} to Party UUID.
     * @param {string} package Package identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    CreatePackageRequest(
        party,
        to,
        packageId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/package`);

        url.searchParams.append("party", party);
        url.searchParams.append("to", to);
        url.searchParams.append("package", packageId);

        let tags = {
            endpoint: `${this.FULL_PATH}/package`,
            name: `${this.FULL_PATH}/package`,
            action: TAGS.CreatePackageRequest.action,
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
            },
        });
    }
    /**
     * Gets sent requests for a party.
     *
     * @param {SentRequestsQuery|null} [query]
     * Query parameters. Prefer using {@link SentRequestsQueryBuilder}.
     * @param {number|null} [pageSize]
     * Page size header.
     * @param {number|null} [pageNumber]
     * Page number header.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetSentRequests(
        query = null,
        pageSize = null,
        pageNumber = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/sent`);

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
            endpoint: `${this.FULL_PATH}/sent`,
            name: `${this.FULL_PATH}/sent`,
            action: TAGS.GetSentRequests.action,
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
                ...(pageSize !== null && {
                    "X-Page-Size": pageSize,
                }),
                ...(pageNumber !== null && {
                    "X-Page-Number": pageNumber,
                }),
            },
        });
    }

    /**
     * Gets count of sent requests for a party.
     *
     * @param {SentRequestsQuery|null} [query]
     * Query parameters. Prefer using {@link SentRequestsQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetSentRequestsCount(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/sent/count`);

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
            endpoint: `${this.FULL_PATH}/sent/count`,
            name: `${this.FULL_PATH}/sent/count`,
            action: TAGS.GetSentRequestsCount.action,
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
     * Withdraws a sent request.
     *
     * @param {string} party Party UUID.
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    WithdrawSentRequest(
        party,
        id,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/sent/withdraw`);

        url.searchParams.append("party", party);
        url.searchParams.append("id", id);

        let tags = {
            endpoint: `${this.FULL_PATH}/sent/withdraw`,
            name: `${this.FULL_PATH}/sent/withdraw`,
            action: TAGS.WithdrawSentRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Gets a request by id.
     *
     * @param {string} party Party UUID.
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetRequest(
        party,
        id,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

        url.searchParams.append("party", party);
        url.searchParams.append("id", id);

        let tags = {
            endpoint: `${this.FULL_PATH}`,
            name: `${this.FULL_PATH}`,
            action: TAGS.GetRequest.action,
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
     * Gets a draft request.
     *
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetDraftRequest(
        id,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/draft`);

        url.searchParams.append("id", id);

        let tags = {
            endpoint: `${this.FULL_PATH}/draft`,
            name: `${this.FULL_PATH}/draft`,
            action: TAGS.GetDraftRequest.action,
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
     * Confirms a draft request.
     *
     * @param {string} party Party UUID.
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ConfirmDraftRequest(
        party,
        id,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/draft/confirm`);

        url.searchParams.append("party", party);
        url.searchParams.append("id", id);

        let tags = {
            endpoint: `${this.FULL_PATH}/draft/confirm`,
            name: `${this.FULL_PATH}/draft/confirm`,
            action: TAGS.ConfirmDraftRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}

export {
    RequestClient,
};
