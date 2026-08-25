import http from "k6/http";

import { ValidatePersonInput } from "../common/common.types.js";
import { CreateRightHolderQuery, DeleteReporteeConnectionQuery, GetRightHoldersQuery, GetSimplifiedConnectionsQuery } from "./connection.types.js";

const TAGS = {
    GetReporteeRightHolders: {
        action: "get-reportee-right-holders",
    },
    DeleteReporteeConnection: {
        action: "delete-reportee-connection",
    },
    ValidatePerson: {
        action: "validate-person",
    },
    CreateRightHolder: {
        action: "create-right-holder",
    },
    GetRightHolders: {
        action: "get-right-holders",
    },
    GetSimplifiedConnections: {
        action: "get-simplified-connections",
    },
};

/**
 * Client for the connection endpoints of the Access Management BFF API.
 */
class ConnectionClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/connection";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the right holders of a reportee.
     *
     * @param {number} partyId Party id of the reportee.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReporteeRightHolders(partyId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/reportee/${partyId}/rightholders`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/reportee/{partyId}/rightholders`,
            name: `${this.FULL_PATH}/reportee/{partyId}/rightholders`,
            action: TAGS.GetReporteeRightHolders.action,
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
     * Removes a connection between a reportee and a right holder.
     *
     * @param {DeleteReporteeConnectionQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteReporteeConnectionQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteReporteeConnection(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/reportee`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/reportee`,
            name: `${this.FULL_PATH}/reportee`,
            action: TAGS.DeleteReporteeConnection.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Validates a person before adding them as a right holder.
     *
     * @param {string} partyUuid Party UUID of the reportee.
     * @param {ValidatePersonInput|null} [body] The person to validate. Prefer
     * using {@link ValidatePersonInputBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ValidatePerson(partyUuid, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/reportee/${partyUuid}/rightholder/validateperson`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/reportee/{partyUuid}/rightholder/validateperson`,
            name: `${this.FULL_PATH}/reportee/{partyUuid}/rightholder/validateperson`,
            action: TAGS.ValidatePerson.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Adds a right holder to a reportee.
     *
     * @param {string} partyUuid Party UUID of the reportee.
     * @param {ValidatePersonInput|null} [body] The person to add, when they are
     * identified by national identity number instead of party UUID. Prefer using
     * {@link ValidatePersonInputBuilder}. Either this or the rightholderPartyUuid
     * query parameter must be given, not both.
     * @param {CreateRightHolderQuery|null} [query] Optional query parameters.
     * Prefer using {@link CreateRightHolderQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateRightHolder(partyUuid, body = null, query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/reportee/${partyUuid}/rightholder`,
        );

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/reportee/{partyUuid}/rightholder`,
            name: `${this.FULL_PATH}/reportee/{partyUuid}/rightholder`,
            action: TAGS.CreateRightHolder.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets the connections a party has as right holder or reportee.
     *
     * @param {GetRightHoldersQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetRightHoldersQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRightHolders(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/rightholders`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/rightholders`,
            name: `${this.FULL_PATH}/rightholders`,
            action: TAGS.GetRightHolders.action,
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
     * Gets the connections of a party in a simplified form.
     *
     * @param {GetSimplifiedConnectionsQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetSimplifiedConnectionsQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSimplifiedConnections(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/simplified`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/simplified`,
            name: `${this.FULL_PATH}/simplified`,
            action: TAGS.GetSimplifiedConnections.action,
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

export { ConnectionClient };
