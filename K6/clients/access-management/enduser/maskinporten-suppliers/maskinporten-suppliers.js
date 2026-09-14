import http from "k6/http";

import { buildUrl, requestParams } from "../../../common/request.js";
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMaskinportenSuppliers(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}`, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetMaskinportenSuppliers.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates a Maskinporten supplier connection.
     *
     * @param {MaskinportenSuppliersQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSuppliersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateMaskinportenSupplier(query = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}`, query),
            null,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.CreateMaskinportenSupplier.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Deletes a Maskinporten supplier connection.
     *
     * @param {MaskinportenSuppliersQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSuppliersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMaskinportenSupplier(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}`, query),
            null,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.DeleteMaskinportenSupplier.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves resource permissions for Maskinporten suppliers.
     *
     * @param {MaskinportenSupplierResourcesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSupplierResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMaskinportenSupplierResources(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources`,
                action: TAGS.GetMaskinportenSupplierResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates a resource delegation for a Maskinporten supplier.
     *
     * @param {MaskinportenSupplierResourcesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSupplierResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateMaskinportenSupplierResource(query = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/resources`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/resources`,
                action: TAGS.CreateMaskinportenSupplierResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Deletes a resource delegation for a Maskinporten supplier.
     *
     * @param {MaskinportenSupplierResourcesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSupplierResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMaskinportenSupplierResource(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/resources`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/resources`,
                action: TAGS.DeleteMaskinportenSupplierResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks whether a Maskinporten supplier resource can be delegated.
     *
     * @param {MaskinportenSupplierDelegationCheckQuery|null} [query]
     * Query parameters. Prefer using
     * {@link MaskinportenSupplierDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMaskinportenSupplierDelegationCheck(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources/delegationcheck`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/delegationcheck`,
                action: TAGS.GetMaskinportenSupplierDelegationCheck.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { MaskinportenSuppliersClient };
