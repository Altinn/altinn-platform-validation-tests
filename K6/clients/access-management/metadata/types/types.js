import http from "k6/http";

import { requestParams } from "../../../common/request.js";

const TAGS = {
    TypesGetOrganizationSubTypes: {
        action: "types-get-organization-sub-types",
    },
};

class TypesClient {
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
     * Gets organization sub types.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    TypesGetOrganizationSubTypes(labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta/types/organization/subtypes`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/types/organization/subtypes`,
                action: TAGS.TypesGetOrganizationSubTypes.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { TypesClient };
