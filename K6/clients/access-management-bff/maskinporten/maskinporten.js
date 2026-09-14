import http from "k6/http";

import { buildUrl, requestParams } from "../../common/request.js";
import { CreateSupplierQuery, CreateSupplierResourceQuery, DeleteConsumerQuery, DeleteConsumerResourceQuery, DeleteSupplierQuery, DeleteSupplierResourceQuery, GetConsumerResourcesQuery, GetConsumersQuery, GetSupplierResourceDelegationCheckQuery, GetSupplierResourcesQuery, GetSuppliersQuery, SearchScopesQuery } from "./maskinporten.types.js";

const TAGS = {
    SearchScopes: {
        action: "search-scopes",
    },
    GetSupplierResourceDelegationCheck: {
        action: "get-supplier-resource-delegation-check",
    },
    GetSupplierResources: {
        action: "get-supplier-resources",
    },
    CreateSupplierResource: {
        action: "create-supplier-resource",
    },
    DeleteSupplierResource: {
        action: "delete-supplier-resource",
    },
    GetSuppliers: {
        action: "get-suppliers",
    },
    CreateSupplier: {
        action: "create-supplier",
    },
    DeleteSupplier: {
        action: "delete-supplier",
    },
    GetConsumers: {
        action: "get-consumers",
    },
    DeleteConsumer: {
        action: "delete-consumer",
    },
    GetConsumerResources: {
        action: "get-consumer-resources",
    },
    DeleteConsumerResource: {
        action: "delete-consumer-resource",
    },
};

/**
 * Client for the Maskinporten endpoints of the Access Management BFF API.
 */
class MaskinportenClient {
    /**
     * @param {string} baseUrl Base URL of the host serving the Access Management
     * frontend.
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
        this.BASE_PATH = "/accessmanagement/api/v1/maskinporten";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Searches the Maskinporten scopes a party can delegate.
     *
     * @param {SearchScopesQuery|null} [query] Optional query parameters. Prefer
     * using {@link SearchScopesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SearchScopes(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/scopes/search`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/scopes/search`,
                action: TAGS.SearchScopes.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks whether a resource can be delegated to a Maskinporten supplier.
     *
     * @param {GetSupplierResourceDelegationCheckQuery} query Query parameters.
     * Prefer using {@link GetSupplierResourceDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSupplierResourceDelegationCheck(query, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/suppliers/resources/delegationcheck`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/suppliers/resources/delegationcheck`,
                action: TAGS.GetSupplierResourceDelegationCheck.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the resources delegated to the Maskinporten suppliers of a party.
     *
     * @param {GetSupplierResourcesQuery} query Query parameters. Prefer using
     * {@link GetSupplierResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSupplierResources(query, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/suppliers/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/suppliers/resources`,
                action: TAGS.GetSupplierResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Delegates a resource to a Maskinporten supplier.
     *
     * @param {CreateSupplierResourceQuery} query Query parameters. Prefer using
     * {@link CreateSupplierResourceQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateSupplierResource(query, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/suppliers/resources`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/suppliers/resources`,
                action: TAGS.CreateSupplierResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes a resource delegated to a Maskinporten supplier.
     *
     * @param {DeleteSupplierResourceQuery} query Query parameters. Prefer using
     * {@link DeleteSupplierResourceQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteSupplierResource(query, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/suppliers/resources`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/suppliers/resources`,
                action: TAGS.DeleteSupplierResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the Maskinporten suppliers of a party.
     *
     * @param {GetSuppliersQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetSuppliersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSuppliers(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/suppliers`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/suppliers`,
                action: TAGS.GetSuppliers.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Adds a Maskinporten supplier to a party.
     *
     * @param {CreateSupplierQuery} query Query parameters. Prefer using
     * {@link CreateSupplierQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateSupplier(query, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/suppliers`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/suppliers`,
                action: TAGS.CreateSupplier.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Removes a Maskinporten supplier from a party.
     *
     * @param {DeleteSupplierQuery} query Query parameters. Prefer using
     * {@link DeleteSupplierQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteSupplier(query, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/suppliers`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/suppliers`,
                action: TAGS.DeleteSupplier.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the Maskinporten consumers of a party.
     *
     * @param {GetConsumersQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetConsumersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetConsumers(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/consumers`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/consumers`,
                action: TAGS.GetConsumers.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Removes a Maskinporten consumer from a party.
     *
     * @param {DeleteConsumerQuery} query Query parameters. Prefer using
     * {@link DeleteConsumerQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteConsumer(query, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/consumers`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/consumers`,
                action: TAGS.DeleteConsumer.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the resources the Maskinporten consumers of a party hold.
     *
     * @param {GetConsumerResourcesQuery} query Query parameters. Prefer using
     * {@link GetConsumerResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetConsumerResources(query, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/consumers/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/consumers/resources`,
                action: TAGS.GetConsumerResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes a resource a Maskinporten consumer holds.
     *
     * @param {DeleteConsumerResourceQuery} query Query parameters. Prefer using
     * {@link DeleteConsumerResourceQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteConsumerResource(query, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/consumers/resources`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/consumers/resources`,
                action: TAGS.DeleteConsumerResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { MaskinportenClient };
