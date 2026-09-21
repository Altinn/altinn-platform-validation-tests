import http from "k6/http";

import { buildUrl, requestParams } from "../common/request.js";
import { AccessListMembershipsQuery } from "./types.js";

const TAGS = {
    AccessListMembershipsGetMemberships: {
        action: "access-list-memberships-get-memberships",
    },
    AccessListGetByMember: {
        action: "access-list-get-by-member",
    },
};

/**
 * Client for the access list endpoints that are reserved for platform
 * components: the memberships query and the get-by-member lookup.
 *
 * Both endpoints authenticate with a platform access token sent in the
 * `PlatformAccessToken` header, not as a bearer token, and the token has to be
 * issued for the `platform` organization (AccessTokenRequirement("platform") in
 * the registry). A bearer token gets 401 here, whatever scopes it carries, so
 * the token generator handed to the constructor has to be a
 * PlatformTokenGenerator built with `withOrganization("platform")`. The other
 * access list endpoints take a bearer token and live in AccessListClient.
 *
 * The memberships query also accepts a bearer token with the
 * `altinn:resourceregistry/resource.admin` scope, but get-by-member does not,
 * so this client sticks to the platform access token for both.
 */
class AccessListMembershipsClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates platform access tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/resourceregistry/api/v1/access-lists/memberships";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;

        /**
         * Fully-qualified path of the get-by-member lookup, which sits beside
         * the memberships path rather than under it.
         */
        this.GET_BY_MEMBER_PATH = `${baseUrl}/resourceregistry/api/v1/access-lists/get-by-member`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets memberships for parties and resources.
     *
     * @param {AccessListMembershipsQuery|null} [query] Optional query parameters.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListMembershipsGetMemberships(query = null, labels = null) {
        return http.get(
            buildUrl(this.FULL_PATH, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.AccessListMembershipsGetMemberships.action,
                labels,
                token: null,
                headers: { PlatformAccessToken: this.tokenGenerator.getToken() },
            }),
        );
    }

    /**
     * Gets access lists for a given member.
     *
     * @param {string} party Member party UUID URN.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AccessListGetByMember(party, labels = null) {
        return http.get(
            buildUrl(this.GET_BY_MEMBER_PATH, { party }),
            requestParams({
                endpoint: this.GET_BY_MEMBER_PATH,
                action: TAGS.AccessListGetByMember.action,
                labels,
                token: null,
                headers: { PlatformAccessToken: this.tokenGenerator.getToken() },
            }),
        );
    }
}

export { AccessListMembershipsClient };
