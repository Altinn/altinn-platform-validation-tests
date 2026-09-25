import http from "k6/http";

import { buildUrl, requestParams } from "../common/request.js";
import { ResourcePolicyRightsQuery } from "./types.js";

const TAGS = {
    ResourceV2GetPolicyRights: {
        action: "resource-v2-get-policy-rights",
    },
};

class ResourceV2Client {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} [tokenGenerator] Generates bearer tokens. The policy rights
     * endpoint is public, so a client built without one sends no Authorization
     * header.
     */
    constructor(baseUrl, tokenGenerator = null) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/resourceregistry/api/v2/resource";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the policy rights for a resource.
     *
     * @param {string} id Resource identifier.
     * @param {ResourcePolicyRightsQuery|null} [query] Optional query parameters.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceV2GetPolicyRights(
        id,
        query = null,
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${encodeURIComponent(id)}/policy/rights`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}/policy/rights`,
                action: TAGS.ResourceV2GetPolicyRights.action,
                labels,
                token: this.tokenGenerator?.getToken() || null,
            }),
        );
    }
}

export { ResourceV2Client };
