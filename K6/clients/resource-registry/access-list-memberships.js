import http from "k6/http";

import { buildUrl, requestParams } from "../common/request.js";
import { AccessListMembershipsQuery } from "./types.js";

const TAGS = {
    AccessListMembershipsGetMemberships: {
        action: "access-list-memberships-get-memberships",
    },
};

class AccessListMembershipsClient {
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
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { AccessListMembershipsClient };
