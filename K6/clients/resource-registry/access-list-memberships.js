import http from "k6/http";

import { buildUrl, requestParams } from "../common/request.js";
import { AccessListMembershipsQuery } from "./types.js";

const TAGS = {
    AccessListMembershipsGetMemberships: {
        action: "access-list-memberships-get-memberships",
    },
};

/**
 * Client for the memberships query, which is reserved for platform
 * components.
 *
 * The endpoint authenticates with a platform access token sent in the
 * `PlatformAccessToken` header, not as a bearer token, and the token has to be
 * issued for the `platform` organization (AccessTokenRequirement("platform") in
 * the registry). A bearer token gets 401 here, whatever scopes it carries, so
 * the token generator handed to the constructor has to be a
 * PlatformTokenGenerator built with `withOrganization("platform")`. The
 * registry also accepts a bearer token with the
 * `altinn:resourceregistry/resource.admin` scope on this endpoint, but the
 * client sticks to the platform access token.
 *
 * The get-by-member lookup takes the same token but sits under the Access List
 * tag in the swagger, so it lives in AccessListClient.
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
}

export { AccessListMembershipsClient };
