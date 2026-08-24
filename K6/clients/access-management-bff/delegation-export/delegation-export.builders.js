import { GetDelegationExportQuery } from "./delegation-export.types.js";

/**
 * Builder for the query parameters of {@link GetDelegationExport}.
 */
class GetDelegationExportQueryBuilder {
    constructor() {
        this.query = /** @type {GetDelegationExportQuery} */ ({});
    }

    /**
     * Optional. Party UUID to export delegations for.
     *
     * @param {string} partyUuid Party UUID to export delegations for.
     * @returns {GetDelegationExportQueryBuilder} This builder, for chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Optional. Whether to include the subunits of the party.
     *
     * @param {boolean} includeSubunits Whether to include the subunits of the
     * party.
     * @returns {GetDelegationExportQueryBuilder} This builder, for chaining.
     */
    withIncludeSubunits(includeSubunits) {
        this.query.includeSubunits = includeSubunits;
        return this;
    }

    /**
     * Optional. Comma separated list of delegation types.
     *
     * @param {string} types Comma separated list of delegation types.
     * @returns {GetDelegationExportQueryBuilder} This builder, for chaining.
     */
    withTypes(types) {
        this.query.types = types;
        return this;
    }

    /**
     * Optional. Language code of the export, e.g. nb.
     *
     * @param {string} languageCode Language code of the export, e.g. nb.
     * @returns {GetDelegationExportQueryBuilder} This builder, for chaining.
     */
    withLanguageCode(languageCode) {
        this.query.languageCode = languageCode;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetDelegationExportQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

export {
    GetDelegationExportQueryBuilder,
};
