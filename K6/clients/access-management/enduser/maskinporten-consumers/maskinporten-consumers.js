import http from "k6/http";

import { MaskinportenConsumerResourcesQuery, MaskinportenConsumersQuery } from "./maskinporten-consumers.types.js";

const TAGS = {
    GetMaskinportenConsumers: {
        action: "get-maskinporten-consumers",
    },
    DeleteMaskinportenConsumer: {
        action: "delete-maskinporten-consumer",
    },
    GetMaskinportenConsumerResources: {
        action: "get-maskinporten-consumer-resources",
    },
    DeleteMaskinportenConsumerResource: {
        action: "delete-maskinporten-consumer-resource",
    },
};

class MaskinportenConsumersClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/enduser/maskinportenconsumers";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets Maskinporten consumers for a party.
     *
     * @param {MaskinportenConsumersQuery|null} [query]
     * Optional query parameters. Prefer using
     * {@link MaskinportenConsumersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMaskinportenConsumers(query = null, labels = null) {
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
            action: TAGS.GetMaskinportenConsumers.action,
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
     * Deletes a Maskinporten consumer connection.
     *
     * @param {MaskinportenConsumersQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenConsumersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMaskinportenConsumer(query = null, labels = null) {
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
            action: TAGS.DeleteMaskinportenConsumer.action,
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
     * Gets resource permissions for a Maskinporten consumer.
     *
     * @param {MaskinportenConsumerResourcesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenConsumerResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMaskinportenConsumerResources(query = null, labels = null) {
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
            action: TAGS.GetMaskinportenConsumerResources.action,
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
     * Deletes a resource permission for a Maskinporten consumer.
     *
     * @param {MaskinportenConsumerResourcesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenConsumerResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMaskinportenConsumerResource(query = null, labels = null) {
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
            action: TAGS.DeleteMaskinportenConsumerResource.action,
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
}

export { MaskinportenConsumersClient };
