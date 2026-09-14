import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
import { DelegateSingleRightsQuery, GetResourceDelegationsQuery, GetResourceRightsQuery, GetRightsMetaQuery, GetSingleRightDelegationCheckQuery, RevokeSingleRightsQuery, UpdateSingleRightsQuery } from "./single-right.types.js";

const TAGS = {
    GetSingleRightDelegationCheck: {
        action: "get-single-right-delegation-check",
    },
    GetRightsMeta: {
        action: "get-rights-meta",
    },
    DelegateSingleRights: {
        action: "delegate-single-rights",
    },
    GetResourceDelegations: {
        action: "get-resource-delegations",
    },
    GetResourceRights: {
        action: "get-resource-rights",
    },
    RevokeSingleRights: {
        action: "revoke-single-rights",
    },
    UpdateSingleRights: {
        action: "update-single-rights",
    },
};

/**
 * Client for the single right endpoints of the Access Management BFF API.
 */
class SingleRightClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/singleright";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Checks which rights on a resource the authenticated user can delegate.
     *
     * @param {GetSingleRightDelegationCheckQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetSingleRightDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSingleRightDelegationCheck(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/delegationcheck`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegationcheck`,
                action: TAGS.GetSingleRightDelegationCheck.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the rights a resource defines.
     *
     * @param {GetRightsMetaQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetRightsMetaQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRightsMeta(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/rightsmeta`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/rightsmeta`,
                action: TAGS.GetRightsMeta.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Delegates rights on a resource to a party.
     *
     * @param {DelegateSingleRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link DelegateSingleRightsQueryBuilder}.
     * @param {Array<string>|null} [body] Keys of the rights to delegate.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DelegateSingleRights(query = null, body = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/delegate`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegate`,
                action: TAGS.DelegateSingleRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the resources delegated between two parties.
     *
     * @param {GetResourceDelegationsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetResourceDelegationsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResourceDelegations(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/delegation/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegation/resources`,
                action: TAGS.GetResourceDelegations.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the rights a party holds on a resource.
     *
     * @param {GetResourceRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetResourceRightsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResourceRights(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/delegation/resources/rights`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegation/resources/rights`,
                action: TAGS.GetResourceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes all rights a party holds on a resource.
     *
     * @param {RevokeSingleRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link RevokeSingleRightsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RevokeSingleRights(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/revoke`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/revoke`,
                action: TAGS.RevokeSingleRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Replaces the rights a party holds on a resource.
     *
     * @param {UpdateSingleRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link UpdateSingleRightsQueryBuilder}.
     * @param {Array<string>|null} [body] Keys of the rights to keep.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateSingleRights(query = null, body = null, labels = null) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/update`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/update`,
                action: TAGS.UpdateSingleRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { SingleRightClient };
