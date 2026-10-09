import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { AccessListGetByOwnerQuery, AccessListGetQuery, AccessListPagedQuery, CreateAccessListModel, JsonPatchOperation, UpsertAccessListResourceConnectionDto } from "./types.js";

const TAGS = {
    AccessListGetByMember: {
        action: "access-list-get-by-member",
    },
    AccessListGetByOwner: {
        action: "access-list-get-by-owner",
    },
    AccessListGet: {
        action: "access-list-get",
    },
    AccessListDelete: {
        action: "access-list-delete",
    },
    AccessListUpsert: {
        action: "access-list-upsert",
    },
    AccessListPatch: {
        action: "access-list-patch",
    },
    AccessListGetMembers: {
        action: "access-list-get-members",
    },
    AccessListReplaceMembers: {
        action: "access-list-replace-members",
    },
    AccessListAddMembers: {
        action: "access-list-add-members",
    },
    AccessListRemoveMembers: {
        action: "access-list-remove-members",
    },
    AccessListGetResourceConnections: {
        action: "access-list-get-resource-connections",
    },
    AccessListUpsertResourceConnection: {
        action: "access-list-upsert-resource-connection",
    },
    AccessListDeleteResourceConnection: {
        action: "access-list-delete-resource-connection",
    },
};

/**
 * Client for the access list endpoints under the Access List tag: the lists
 * themselves, their members, their resource connections and the get-by-member
 * lookup.
 *
 * The endpoints do not share an authentication scheme. Everything but
 * get-by-member takes a bearer token with the access list scopes for the owner
 * org. get-by-member is reserved for platform components and takes a platform
 * access token issued for the `platform` organization, sent in the
 * `PlatformAccessToken` header; a bearer token gets 401 there, whatever scopes
 * it carries. The token generator handed to the constructor therefore has to
 * match the methods the caller intends to use, which in practice means one
 * client instance per token flavour, as RegisterClient does.
 */
class AccessListClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates the tokens used to call the API. See the class doc.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/resourceregistry/api/v1/access-lists/";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets access lists for a given member.
     *
     * Reserved for platform components: the token generator of this instance
     * has to be a PlatformTokenGenerator built with `withOrganization("platform")`,
     * and the token goes in the PlatformAccessToken header, not as a bearer token.
     *
     * @param {string} party Member party UUID URN.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListGetByMember(party, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}get-by-member`, { party }),
            requestParams({
                endpoint: `${this.FULL_PATH}get-by-member`,
                action: TAGS.AccessListGetByMember.action,
                labels,
                token: null,
                headers: { PlatformAccessToken: this.tokenGenerator.getToken() },
            }),
        );
    }

    /**
     * Gets access lists for a resource owner.
     *
     * @param {string} owner Resource owner.
     * @param {AccessListGetByOwnerQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListGetByOwner(owner, query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}${owner}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}`,
                action: TAGS.AccessListGetByOwner.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets an access list by owner and identifier.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {AccessListGetQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}|null} [headers] Optional request headers.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListGet(owner, identifier, query = null, headers = {}, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}${owner}/${identifier}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}`,
                action: TAGS.AccessListGet.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Deletes an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {{[key: string]: string}|null} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListDelete(owner, identifier, headers = {}, labels = null) {
        return http.del(
            `${this.FULL_PATH}${owner}/${identifier}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}`,
                action: TAGS.AccessListDelete.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Creates or updates an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {CreateAccessListModel} request Access list payload.
     * @param {{[key: string]: string}|null} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListUpsert(owner, identifier, request, headers = {}, labels = null) {
        return http.put(
            `${this.FULL_PATH}${owner}/${identifier}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}`,
                action: TAGS.AccessListUpsert.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                accept: null,
                headers,
            }),
        );
    }

    /**
     * Updates an access list using JSON Patch.
     *
     * The endpoint consumes `application/json-patch+json` only and answers 415
     * to a plain JSON content type, so the header is set here rather than
     * through the `json` option.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {Array<JsonPatchOperation>} request Patch operations.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListPatch(owner, identifier, request, labels = null) {
        return http.patch(
            `${this.FULL_PATH}${owner}/${identifier}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}`,
                action: TAGS.AccessListPatch.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { "Content-Type": "application/json-patch+json" },
            }),
        );
    }

    /**
     * Gets access list members.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {AccessListPagedQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}|null} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListGetMembers(
        owner,
        identifier,
        query = null,
        headers = {},
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}${owner}/${identifier}/members`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}/members`,
                action: TAGS.AccessListGetMembers.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Replaces access list members.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {{data:Array<string>}} request Members payload.
     * @param {{[key: string]: string}|null} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListReplaceMembers(
        owner,
        identifier,
        request,
        headers = {},
        labels = null,
    ) {
        return http.put(
            `${this.FULL_PATH}${owner}/${identifier}/members`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}/members`,
                action: TAGS.AccessListReplaceMembers.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                accept: null,
                headers,
            }),
        );
    }

    /**
     * Adds members to an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {{data:Array<string>}} request Members payload.
     * @param {{[key: string]: string}|null} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListAddMembers(
        owner,
        identifier,
        request,
        headers = {},
        labels = null,
    ) {
        return http.post(
            `${this.FULL_PATH}${owner}/${identifier}/members`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}/members`,
                action: TAGS.AccessListAddMembers.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                accept: null,
                headers,
            }),
        );
    }

    /**
     * Removes members from an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {{data:Array<string>}} request Members payload.
     * @param {{[key: string]: string}|null} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListRemoveMembers(
        owner,
        identifier,
        request,
        headers = {},
        labels = null,
    ) {
        return http.del(
            `${this.FULL_PATH}${owner}/${identifier}/members`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}/members`,
                action: TAGS.AccessListRemoveMembers.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                accept: null,
                headers,
            }),
        );
    }

    /**
     * Gets resource connections for an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {AccessListPagedQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}|null} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListGetResourceConnections(
        owner,
        identifier,
        query = null,
        headers = {},
        labels = null,
    ) {
        return http.get(
            buildUrl(
                `${this.FULL_PATH}${owner}/${identifier}/resource-connections`,
                query,
            ),
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}/resource-connections`,
                action: TAGS.AccessListGetResourceConnections.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Creates or updates a resource connection.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {string} resourceIdentifier Resource identifier.
     * @param {UpsertAccessListResourceConnectionDto} request Resource connection payload.
     * @param {{[key: string]: string}|null} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListUpsertResourceConnection(
        owner,
        identifier,
        resourceIdentifier,
        request,
        headers = {},
        labels = null,
    ) {
        return http.put(
            `${this.FULL_PATH}${owner}/${identifier}/resource-connections/${resourceIdentifier}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}/resource-connections/{resourceIdentifier}`,
                action: TAGS.AccessListUpsertResourceConnection.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                accept: null,
                headers,
            }),
        );
    }

    /**
     * Removes a resource connection from an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {string} resourceIdentifier Resource identifier.
     * @param {{[key: string]: string}|null} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListDeleteResourceConnection(
        owner,
        identifier,
        resourceIdentifier,
        headers = {},
        labels = null,
    ) {
        return http.del(
            `${this.FULL_PATH}${owner}/${identifier}/resource-connections/${resourceIdentifier}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}{owner}/{identifier}/resource-connections/{resourceIdentifier}`,
                action: TAGS.AccessListDeleteResourceConnection.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }
}

export { AccessListClient };
