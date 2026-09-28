import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../../common/request.js";
import { GetResourceRightsQuery, ServiceOwnerAccessPackageDelegation, ServiceOwnerResourceDelegation } from "./connections.types.js";

const TAGS = {
    ConnectionsCreateAccessPackage: {
        action: "connections-create-access-package",
    },
    ConnectionsRevokeAccessPackage: {
        action: "connections-revoke-access-package",
    },
    ConnectionsGetResourceRights: {
        action: "connections-get-resource-rights",
    },
    ConnectionsCreateResource: {
        action: "connections-create-resource",
    },
    ConnectionsRevokeResource: {
        action: "connections-revoke-resource",
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
        this.BASE_PATH = "/accessmanagement/api/v1";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates a service owner access package delegation.
     *
     * @param {ServiceOwnerAccessPackageDelegation} request Delegation payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ConnectionsCreateAccessPackage(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/serviceowner/connections/accesspackages`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/serviceowner/connections/accesspackages`,
                action: TAGS.ConnectionsCreateAccessPackage.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Revokes a service owner access package delegation.
     *
     * @param {ServiceOwnerAccessPackageDelegation} request Delegation payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ConnectionsRevokeAccessPackage(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/serviceowner/connections/accesspackages/revoke`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/serviceowner/connections/accesspackages/revoke`,
                action: TAGS.ConnectionsRevokeAccessPackage.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the rights available for a resource.
     *
     * @param {GetResourceRightsQuery|null} [query]
     * Query parameters. Prefer using {@link GetResourceRightsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ConnectionsGetResourceRights(query = null, labels = null) {
        const endpoint = `${this.FULL_PATH}/serviceowner/connections/resources/rights`;

        return http.get(
            buildUrl(endpoint, query),
            requestParams({
                endpoint,
                action: TAGS.ConnectionsGetResourceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates a service owner resource delegation.
     *
     * @param {ServiceOwnerResourceDelegation} request Delegation payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ConnectionsCreateResource(request, labels = null) {
        const endpoint = `${this.FULL_PATH}/serviceowner/connections/resources`;

        return http.post(
            endpoint,
            jsonBody(request),
            requestParams({
                endpoint,
                action: TAGS.ConnectionsCreateResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Revokes a service owner resource delegation.
     *
     * @param {ServiceOwnerResourceDelegation} request Delegation payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ConnectionsRevokeResource(request, labels = null) {
        const endpoint = `${this.FULL_PATH}/serviceowner/connections/resources/revoke`;

        return http.post(
            endpoint,
            jsonBody(request),
            requestParams({
                endpoint,
                action: TAGS.ConnectionsRevokeResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { ConnectionsClient };
