import http from "k6/http";

import {
    AuthorizedPartiesQuery,
    AuthorizedPartyRequest,
    UrnAttribute,
} from "./authorized-parties.types.js";

const DEFAULT_PARTY_FILTER_LENGTH = Number(__ENV.LENGTH_PARTY_FILTER ?? "25");

const TAGS = {
    GetAuthorizedParties: { action: "get-authorized-parties" },
};

class AuthorizedPartiesClient {
    /**
     * Creates a client for the Authorized Parties API.
     *
     * @param {string} baseUrl API base URL, for example https://platform.at22.altinn.cloud.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    /**
     * Default request tags used by the client.
     *
     * @returns {object} Default k6 tags.
     */
    static get TAGS() {
        return TAGS;
    }

    /**
     * Retrieves authorized parties for a subject.
     *
     * Docs:
     * {@link https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/#/Authorized%20Parties}
     *
     * @param {string} type Subject identifier type.
     * @param {string} value Subject identifier value.
     * @param {AuthorizedPartiesQuery|null} [queryParams] Optional query parameters.
     * @param {Array<string>|null} [parties] Optional party identifiers used to create partyFilter.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} k6 HTTP response.
     */
    GetAuthorizedParties(
        type,
        value,
        queryParams = null,
        parties = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/resourceowner/authorizedparties`,
        );

        if (queryParams !== null) {
            Object.entries(queryParams).forEach(([key, queryValue]) => {
                if (queryValue !== undefined && queryValue !== null) {
                    url.searchParams.append(key, queryValue);
                }
            });
        }

        const tags = {
            ...TAGS.GetAuthorizedParties,
            endpoint: url.toString(),
            name: url.toString(),
            ...labels,
        };

        /** @type {AuthorizedPartyRequest} */
        const body = {
            type,
            value,
        };

        if (parties !== null) {
            body.partyFilter = this.#getPartyFilter(
                parties,
                DEFAULT_PARTY_FILTER_LENGTH,
                value,
            );
        }

        return http.post(
            url.toString(),
            JSON.stringify(body),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }

    /**
     * Creates party filter objects from party identifiers.
     *
     * @param {Array<string>} parties Party identifiers.
     * @param {number} length Maximum number of parties to include.
     * @param {string} subjectValue Subject identifier.
     * @returns {Array<UrnAttribute>} Party filters.
     */
    #getPartyFilter(parties, length, subjectValue) {
        /** @type {Array<UrnAttribute>} */
        const result = [
            {
                type: "urn:altinn:person:identifier-no",
                value: subjectValue,
            },
        ];

        for (const party of parties) {
            if (result.length >= length) {
                break;
            }

            const [type, id] = party.split(":");

            switch (type) {
                case "org":
                    result.push({
                        type: "urn:altinn:organization:identifier-no",
                        value: id,
                    });
                    break;

                case "person":
                    result.push({
                        type: "urn:altinn:person:identifier-no",
                        value: id,
                    });
                    break;

                default:
                    break;
            }
        }

        return result;
    }
}

export { AuthorizedPartiesClient };
