import http from "k6/http";

import { buildUrl, requestParams } from "../../../common/request.js";
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
        return http.get(
            buildUrl(`${this.FULL_PATH}`, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetMaskinportenConsumers.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.del(
            buildUrl(`${this.FULL_PATH}`, query),
            null,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.DeleteMaskinportenConsumer.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources`,
                action: TAGS.GetMaskinportenConsumerResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.del(
            buildUrl(`${this.FULL_PATH}/resources`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/resources`,
                action: TAGS.DeleteMaskinportenConsumerResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { MaskinportenConsumersClient };
