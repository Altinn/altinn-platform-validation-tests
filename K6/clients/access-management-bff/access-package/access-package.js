import http from "k6/http";

import { buildUrl, requestParams } from "../../common/request.js";
import { CreateAccessPackageDelegationQuery, DeleteAccessPackageDelegationQuery, GetAccessPackageDelegationCheckQuery, GetAccessPackageDelegationsQuery, GetAccessPackagePermissionQuery, SearchAccessPackagesQuery } from "./access-package.types.js";

const TAGS = {
    SearchAccessPackages: {
        action: "search-access-packages",
    },
    GetAccessPackageDelegations: {
        action: "get-access-package-delegations",
    },
    CreateAccessPackageDelegation: {
        action: "create-access-package-delegation",
    },
    DeleteAccessPackageDelegation: {
        action: "delete-access-package-delegation",
    },
    GetAccessPackagePermission: {
        action: "get-access-package-permission",
    },
    GetAccessPackageDelegationCheck: {
        action: "get-access-package-delegation-check",
    },
};

/**
 * Client for the access package endpoints of the Access Management BFF API.
 */
class AccessPackageClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/accesspackage";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Searches access packages, grouped by access area.
     *
     * @param {SearchAccessPackagesQuery|null} [query] Optional query parameters.
     * Prefer using {@link SearchAccessPackagesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SearchAccessPackages(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/search`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/search`,
                action: TAGS.SearchAccessPackages.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the access packages delegated between two parties.
     *
     * @param {GetAccessPackageDelegationsQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetAccessPackageDelegationsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAccessPackageDelegations(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/delegations`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegations`,
                action: TAGS.GetAccessPackageDelegations.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Delegates an access package from one party to another.
     *
     * @param {CreateAccessPackageDelegationQuery|null} [query] Optional query
     * parameters. Prefer using {@link CreateAccessPackageDelegationQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAccessPackageDelegation(query = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/delegations`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/delegations`,
                action: TAGS.CreateAccessPackageDelegation.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes a delegated access package.
     *
     * @param {DeleteAccessPackageDelegationQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteAccessPackageDelegationQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAccessPackageDelegation(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/delegations`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/delegations`,
                action: TAGS.DeleteAccessPackageDelegation.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets a single access package with the permissions behind it.
     *
     * @param {string} packageId Access package UUID.
     * @param {GetAccessPackagePermissionQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetAccessPackagePermissionQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAccessPackagePermission(packageId, query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/permission/${packageId}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/permission/{packageId}`,
                action: TAGS.GetAccessPackagePermission.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks which access packages the authenticated user can delegate for a
     * party.
     *
     * @param {GetAccessPackageDelegationCheckQuery|null} [query] Optional query
     * parameters. Prefer using
     * {@link GetAccessPackageDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAccessPackageDelegationCheck(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/delegationcheck`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegationcheck`,
                action: TAGS.GetAccessPackageDelegationCheck.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { AccessPackageClient };
