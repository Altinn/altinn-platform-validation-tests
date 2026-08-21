import { ApproveConsentContext, ConsentRequestStatusType } from "../common/common.types.js";
import { GetConsentCountQuery } from "./consent.types.js";

/**
 * Builder for the query parameters of {@link GetConsentCount}.
 */
class GetConsentCountQueryBuilder {
    constructor() {
        this.query = /** @type {GetConsentCountQuery} */ ({});
    }

    /**
     * Optional. Consent request status to count.
     *
     * @param {ConsentRequestStatusType} status Consent request status to count.
     * @returns {GetConsentCountQueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetConsentCountQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the {@link ApproveConsentContext} request body.
 */
class ApproveConsentContextBuilder {
    constructor() {
        this.body = {};
    }

    /**
     * Required. Language the consent was approved in, e.g. nb.
     *
     * @param {string} language Language the consent was approved in, e.g. nb.
     * @returns {ApproveConsentContextBuilder} This builder, for chaining.
     */
    withLanguage(language) {
        this.body.language = language;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {ApproveConsentContext} The built payload.
     */
    build() {
        return this.body;
    }
}

export {
    ApproveConsentContextBuilder,
    GetConsentCountQueryBuilder,
};
