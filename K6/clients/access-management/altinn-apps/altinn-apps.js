import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import {
    AppsInstanceDelegationRequestDto,
} from "./altinn-apps.types.js";

const TAGS = {
    CheckResourceDelegation: {
        action: "check-resource-delegation",
    },
    CreateDelegation: {
        action: "create-delegation",
    },
    GetDelegations: {
        action: "get-delegations",
    },
    RevokeDelegation: {
        action: "revoke-delegation",
    },
    DeleteDelegations: {
        action: "delete-delegations",
    },
};

/**
 * Encodes a path value one segment at a time.
 *
 * Instance ids are on the form {instanceOwnerPartyId}/{instanceGuid}, so the
 * separating slash has to stay a slash. Encoding the value as a whole turns it
 * into %2F, which the API will not route.
 *
 * @param {string} value Path value, possibly containing slashes.
 * @returns {string} The value with every segment percent encoded.
 */
function encodePath(value) {
    return String(value)
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
}

class AppsInstanceDelegationClient {
    /**
     * Creates a client for the Apps Instance Delegation API.
     *
     * These endpoints take no user or organization token. The only credential is
     * a platform access token in the PlatformAccessToken header, so the token
     * generator has to be a PlatformTokenGenerator. Access Management reads the
     * issuer and the app claim out of that token and treats app_{issuer}_{app}
     * as the party performing the delegation, then checks it against the
     * resource in the path. Build the token with the org and app that own the
     * resource under test, otherwise the call is turned away no matter how valid
     * the token is.
     *
     * @param {string} baseUrl API base URL.
     * @param {*} tokenGenerator Platform token generator, org and app matching the resource.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates the platform access token the API authenticates on.
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

    /**
     * Default request tags.
     *
     * @returns {typeof TAGS} Tags keyed by client method name.
     */
    static get TAGS() {
        return TAGS;
    }

    /**
     * Checks whether rights may be delegated for an application instance.
     *
     * GET /app/delegationcheck/resource/{resourceId}/instance/{instanceId}
     *
     * @param {string} resourceId Resource identifier.
     * @param {string} instanceId Instance identifier.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CheckResourceDelegation(
        resourceId,
        instanceId,
        labels = null,
    ) {
        return http.get(
            `${this.FULL_PATH}/app/delegationcheck/resource/${encodePath(resourceId)}/instance/${encodePath(instanceId)}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/app/delegationcheck/resource/{resourceId}/instance/{instanceId}`,
                action: TAGS.CheckResourceDelegation.action,
                labels,
                token: null,
                headers: { PlatformAccessToken: this.tokenGenerator.getToken() },
            }),
        );
    }

    /**
     * Creates one or more delegations for an application instance.
     *
     * POST /app/delegations/resource/{resourceId}/instance/{instanceId}
     *
     * @param {string} resourceId Resource identifier.
     * @param {string} instanceId Instance identifier.
     * @param {AppsInstanceDelegationRequestDto} request Delegation request.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateDelegation(
        resourceId,
        instanceId,
        request,
        labels = null,
    ) {
        return http.post(
            `${this.FULL_PATH}/app/delegations/resource/${encodePath(resourceId)}/instance/${encodePath(instanceId)}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/app/delegations/resource/{resourceId}/instance/{instanceId}`,
                action: TAGS.CreateDelegation.action,
                labels,
                token: null,
                json: true,
                headers: { PlatformAccessToken: this.tokenGenerator.getToken() },
            }),
        );
    }

    /**
     * Gets existing delegations for an application instance.
     *
     * GET /app/delegations/resource/{resourceId}/instance/{instanceId}
     *
     * @param {string} resourceId Resource identifier.
     * @param {string} instanceId Instance identifier.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDelegations(
        resourceId,
        instanceId,
        labels = null,
    ) {
        return http.get(
            `${this.FULL_PATH}/app/delegations/resource/${encodePath(resourceId)}/instance/${encodePath(instanceId)}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/app/delegations/resource/{resourceId}/instance/{instanceId}`,
                action: TAGS.GetDelegations.action,
                labels,
                token: null,
                headers: { PlatformAccessToken: this.tokenGenerator.getToken() },
            }),
        );
    }

    /**
     * Revokes one or more delegations for an application instance.
     *
     * POST /app/delegationrevoke/resource/{resourceId}/instance/{instanceId}
     *
     * Note that this endpoint responds with AppsInstanceDelegationResponseDto,
     * not the Revoke variant. That is what the API does, do not "fix" it.
     *
     * @param {string} resourceId Resource identifier.
     * @param {string} instanceId Instance identifier.
     * @param {AppsInstanceDelegationRequestDto} request Revoke request.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RevokeDelegation(
        resourceId,
        instanceId,
        request,
        labels = null,
    ) {
        return http.post(
            `${this.FULL_PATH}/app/delegationrevoke/resource/${encodePath(resourceId)}/instance/${encodePath(instanceId)}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/app/delegationrevoke/resource/{resourceId}/instance/{instanceId}`,
                action: TAGS.RevokeDelegation.action,
                labels,
                token: null,
                json: true,
                headers: { PlatformAccessToken: this.tokenGenerator.getToken() },
            }),
        );
    }

    /**
     * Deletes all delegations for an application instance.
     *
     * DELETE /app/delegationrevoke/resource/{resourceId}/instance/{instanceId}
     *
     * @param {string} resourceId Resource identifier.
     * @param {string} instanceId Instance identifier.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteDelegations(
        resourceId,
        instanceId,
        labels = null,
    ) {
        return http.del(
            `${this.FULL_PATH}/app/delegationrevoke/resource/${encodePath(resourceId)}/instance/${encodePath(instanceId)}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/app/delegationrevoke/resource/{resourceId}/instance/{instanceId}`,
                action: TAGS.DeleteDelegations.action,
                labels,
                token: null,
                headers: { PlatformAccessToken: this.tokenGenerator.getToken() },
            }),
        );
    }
}

export { AppsInstanceDelegationClient };
