import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
import { PersonInput } from "../common/common.types.js";
import { CreateAdministratorQuery, DeleteAdministratorQuery, GetAdministratorsQuery, GetIsBankruptcyEstateAdminQuery } from "./bankruptcy-estate.types.js";

const TAGS = {
    GetIsBankruptcyEstateAdmin: {
        action: "get-is-bankruptcy-estate-admin",
    },
    GetAdministrators: {
        action: "get-administrators",
    },
    CreateAdministrator: {
        action: "create-administrator",
    },
    DeleteAdministrator: {
        action: "delete-administrator",
    },
};

/**
 * Client for the bankruptcy estate endpoints of the Access Management BFF API.
 */
class BankruptcyEstateClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/bankruptcyestate";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Checks whether the authenticated user is a bankruptcy estate administrator.
     *
     * @param {GetIsBankruptcyEstateAdminQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetIsBankruptcyEstateAdminQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsBankruptcyEstateAdmin(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/isBankruptcyEstateAdmin`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/isBankruptcyEstateAdmin`,
                action: TAGS.GetIsBankruptcyEstateAdmin.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the administrators of a bankruptcy estate.
     *
     * @param {GetAdministratorsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetAdministratorsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAdministrators(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/administrators`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/administrators`,
                action: TAGS.GetAdministrators.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Adds an administrator to a bankruptcy estate.
     *
     * @param {PersonInput} body The person to add as administrator. Prefer using
     * {@link PersonInputBuilder}.
     * @param {CreateAdministratorQuery|null} [query] Optional query parameters.
     * Prefer using {@link CreateAdministratorQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAdministrator(body, query = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/administrators`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/administrators`,
                action: TAGS.CreateAdministrator.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Removes an administrator from a bankruptcy estate.
     *
     * @param {DeleteAdministratorQuery|null} [query] Optional query parameters.
     * Prefer using {@link DeleteAdministratorQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAdministrator(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/administrators`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/administrators`,
                action: TAGS.DeleteAdministrator.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { BankruptcyEstateClient };
