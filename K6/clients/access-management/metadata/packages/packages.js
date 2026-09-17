import http from "k6/http";

import { buildUrl, requestParams } from "../../../common/request.js";
import { PackagesSearchQuery } from "./packages.types.js";

const TAGS = {
    PackagesSearch: {
        action: "packages-search",
    },
    PackagesExport: {
        action: "packages-export",
    },
    PackagesGetGroup: {
        action: "packages-get-group",
    },
    PackagesGetGroupById: {
        action: "packages-get-group-by-id",
    },
    PackagesGetGroupAreasById: {
        action: "packages-get-group-areas-by-id",
    },
    PackagesGetAreaById: {
        action: "packages-get-area-by-id",
    },
    PackagesGetAreaPackagesById: {
        action: "packages-get-area-packages-by-id",
    },
    PackagesGetPackageById: {
        action: "packages-get-package-by-id",
    },
    PackagesGetPackageByUrn: {
        action: "packages-get-package-by-urn",
    },
    PackagesGetPackageResourcesById: {
        action: "packages-get-package-resources-by-id",
    },
};

class PackagesClient {
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
     * Searches access packages.
     *
     * @param {PackagesSearchQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PackagesSearch(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/meta/info/accesspackages/search`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/accesspackages/search`,
                action: TAGS.PackagesSearch.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Exports access packages.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PackagesExport(labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta/info/accesspackages/export`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/accesspackages/export`,
                action: TAGS.PackagesExport.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets access package group.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PackagesGetGroup(labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta/info/accesspackages/group`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/accesspackages/group`,
                action: TAGS.PackagesGetGroup.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets access package group by id.
     *
     * @param {string} id Group identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PackagesGetGroupById(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta/info/accesspackages/group/${id}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/accesspackages/group/{id}`,
                action: TAGS.PackagesGetGroupById.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets areas for an access package group.
     *
     * @param {string} id Group identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PackagesGetGroupAreasById(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta/info/accesspackages/group/${id}/areas`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/accesspackages/group/{id}/areas`,
                action: TAGS.PackagesGetGroupAreasById.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets area by id.
     *
     * @param {string} id Area identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PackagesGetAreaById(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta/info/accesspackages/area/${id}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/accesspackages/area/{id}`,
                action: TAGS.PackagesGetAreaById.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets packages for an area.
     *
     * @param {string} id Area identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PackagesGetAreaPackagesById(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta/info/accesspackages/area/${id}/packages`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/accesspackages/area/{id}/packages`,
                action: TAGS.PackagesGetAreaPackagesById.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets package by id.
     *
     * @param {string} id Package identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PackagesGetPackageById(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta/info/accesspackages/package/${id}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/accesspackages/package/{id}`,
                action: TAGS.PackagesGetPackageById.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets package by URN.
     *
     * @param {string} urnValue Package URN.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PackagesGetPackageByUrn(urnValue, labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta/info/accesspackages/package/urn/${urnValue}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/accesspackages/package/urn/{urnValue}`,
                action: TAGS.PackagesGetPackageByUrn.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets resources for a package.
     *
     * @param {string} id Package identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PackagesGetPackageResourcesById(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta/info/accesspackages/package/${id}/resources`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/accesspackages/package/{id}/resources`,
                action: TAGS.PackagesGetPackageResourcesById.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }
}

export { PackagesClient };
