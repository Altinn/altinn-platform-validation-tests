import http from "k6/http";

import { URL } from "../../../common-imports.js";

const TAGS = {
    GetOrganization: {
        action: "get-organization",
    },
    GetParty: {
        action: "get-party",
    },
    GetUser: {
        action: "get-user",
    },
    GetPartyForAuthenticatedUser: {
        action: "get-party-for-authenticated-user",
    },
};

/**
 * Client for the lookup endpoints of the Access Management BFF API.
 */
class LookupClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/lookup";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Looks up a party by organisation number.
     *
     * @param {string} orgNummer Organisation number.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetOrganization(orgNummer, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/org/${orgNummer}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/org/{orgNummer}`,
            name: `${this.FULL_PATH}/org/{orgNummer}`,
            action: TAGS.GetOrganization.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Looks up a party by party UUID.
     *
     * @param {string} uuid Party UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetParty(uuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/party/${uuid}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/party/{uuid}`,
            name: `${this.FULL_PATH}/party/{uuid}`,
            action: TAGS.GetParty.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Looks up a user profile by user UUID.
     *
     * @param {string} uuid User UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetUser(uuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/user/${uuid}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/user/{uuid}`,
            name: `${this.FULL_PATH}/user/{uuid}`,
            action: TAGS.GetUser.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets the party of the authenticated user.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetPartyForAuthenticatedUser(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/party/user`);

        let tags = {
            endpoint: `${this.FULL_PATH}/party/user`,
            name: `${this.FULL_PATH}/party/user`,
            action: TAGS.GetPartyForAuthenticatedUser.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { LookupClient };
