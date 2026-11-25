import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
import { InstanceRightsDelegationDto } from "../common/common.types.js";
import { CreateInstanceRightsQuery, DeleteInstanceDelegationQuery, GetInstanceDelegationCheckQuery, GetInstanceDelegationsQuery, GetInstanceRightsQuery, GetInstanceSimplifiedUsersQuery, UpdateInstanceRightsQuery } from "./instance.types.js";

const TAGS = {
    GetInstanceDelegations: {
        action: "get-instance-delegations",
    },
    DeleteInstanceDelegation: {
        action: "delete-instance-delegation",
    },
    GetInstanceDelegationCheck: {
        action: "get-instance-delegation-check",
    },
    CreateInstanceRights: {
        action: "create-instance-rights",
    },
    GetInstanceRights: {
        action: "get-instance-rights",
    },
    UpdateInstanceRights: {
        action: "update-instance-rights",
    },
    GetInstanceSimplifiedUsers: {
        action: "get-instance-simplified-users",
    },
};

/**
 * Client for the instance delegation endpoints of the Access Management BFF
 * API.
 */
class InstanceClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/instances";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the instances delegated between two parties.
     *
     * @param {GetInstanceDelegationsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetInstanceDelegationsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceDelegations(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/delegation/instances`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegation/instances`,
                action: TAGS.GetInstanceDelegations.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes a delegated instance.
     *
     * @param {DeleteInstanceDelegationQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteInstanceDelegationQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteInstanceDelegation(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/delegation/instances`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/delegation/instances`,
                action: TAGS.DeleteInstanceDelegation.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks which rights on an instance the authenticated user can delegate.
     *
     * @param {GetInstanceDelegationCheckQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetInstanceDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceDelegationCheck(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/delegationcheck`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegationcheck`,
                action: TAGS.GetInstanceDelegationCheck.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Delegates rights on an instance to a person.
     *
     * @param {CreateInstanceRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link CreateInstanceRightsQueryBuilder}.
     * @param {InstanceRightsDelegationDto|null} [body] The person and the rights
     * to delegate. Prefer using {@link InstanceRightsDelegationDtoBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateInstanceRights(query = null, body = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/delegation/instances/rights`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegation/instances/rights`,
                action: TAGS.CreateInstanceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the rights a party holds on an instance.
     *
     * @param {GetInstanceRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetInstanceRightsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceRights(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/delegation/instances/rights`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegation/instances/rights`,
                action: TAGS.GetInstanceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Replaces the rights a party holds on an instance.
     *
     * @param {UpdateInstanceRightsQuery|null} [query] Optional query parameters.
     * Prefer using {@link UpdateInstanceRightsQueryBuilder}.
     * @param {Array<string>|null} [body] Keys of the rights to keep.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateInstanceRights(query = null, body = null, labels = null) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/delegation/instances/rights`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegation/instances/rights`,
                action: TAGS.UpdateInstanceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the users an instance can be delegated to.
     *
     * @param {GetInstanceSimplifiedUsersQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetInstanceSimplifiedUsersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceSimplifiedUsers(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/delegation/instances/simplified/users`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegation/instances/simplified/users`,
                action: TAGS.GetInstanceSimplifiedUsers.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { InstanceClient };
