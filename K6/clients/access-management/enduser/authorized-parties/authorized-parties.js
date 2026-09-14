import http from "k6/http";

import { buildUrl, requestParams } from "../../../common/request.js";
import { EndUserAuthorizedPartiesQuery } from "./authorized-parties.types.js";
import { EndUserAuthorizedPartiesQueryBuilder } from "./authorized-parties-query-builder.js";

const TAGS = {
    GetAuthorizedParties: {
        action: "get-authorized-parties",
    },
};

class AuthorizedPartiesClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/enduser/authorizedparties";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Retrieves the parties the authenticated end user is authorized to represent.
     *
     * @param {EndUserAuthorizedPartiesQuery|null} [query]
     * Optional query parameters. Prefer using
     * {@link EndUserAuthorizedPartiesQueryBuilder} to construct this object.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAuthorizedParties(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}`, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetAuthorizedParties.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { AuthorizedPartiesClient };
