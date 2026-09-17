import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
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
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReporteeRightHolders(partyId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/reportee/${partyId}/rightholders`,
            requestParams({
                endpoint: `${this.FULL_PATH}/reportee/{partyId}/rightholders`,
                action: TAGS.GetReporteeRightHolders.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Removes a connection between a reportee and a right holder.
     *
     * @param {DeleteReporteeConnectionQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteReporteeConnectionQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteReporteeConnection(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/reportee`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/reportee`,
                action: TAGS.DeleteReporteeConnection.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Validates a person before adding them as a right holder.
     *
     * @param {string} partyUuid Party UUID of the reportee.
     * @param {ValidatePersonInput|null} [body] The person to validate. Prefer
     * using {@link ValidatePersonInputBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ValidatePerson(partyUuid, body = null, labels = null) {
        return http.post(
            `${this.FULL_PATH}/reportee/${partyUuid}/rightholder/validateperson`,
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/reportee/{partyUuid}/rightholder/validateperson`,
                action: TAGS.ValidatePerson.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
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
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateRightHolder(partyUuid, body = null, query = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/reportee/${partyUuid}/rightholder`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/reportee/{partyUuid}/rightholder`,
                action: TAGS.CreateRightHolder.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the connections a party has as right holder or reportee.
     *
     * @param {GetRightHoldersQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetRightHoldersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRightHolders(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/rightholders`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/rightholders`,
                action: TAGS.GetRightHolders.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the connections of a party in a simplified form.
     *
     * @param {GetSimplifiedConnectionsQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetSimplifiedConnectionsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSimplifiedConnections(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/simplified`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/simplified`,
                action: TAGS.GetSimplifiedConnections.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { ConnectionClient };
