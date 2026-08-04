/**
 * Builder for the query parameters of {@link ChangeReporteeAndRedirect}.
 */
class ChangeReporteeAndRedirectQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the new reportee.
     *
     * @param {string} partyUuid Party UUID of the new reportee.
     * @returns {ChangeReporteeAndRedirectQueryBuilder} This builder, for chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Optional. Party UUID of the new reportee, legacy parameter.
     *
     * @param {string} p Party UUID of the new reportee, legacy parameter.
     * @returns {ChangeReporteeAndRedirectQueryBuilder} This builder, for chaining.
     */
    withP(p) {
        this.query.P = p;
        return this;
    }

    /**
     * Optional. Party id of the new reportee.
     *
     * @param {number} partyId Party id of the new reportee.
     * @returns {ChangeReporteeAndRedirectQueryBuilder} This builder, for chaining.
     */
    withPartyId(partyId) {
        this.query.partyId = partyId;
        return this;
    }

    /**
     * Optional. URL to redirect to after the change.
     *
     * @param {string} goTo URL to redirect to after the change.
     * @returns {ChangeReporteeAndRedirectQueryBuilder} This builder, for chaining.
     */
    withGoTo(goTo) {
        this.query.goTo = goTo;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {ChangeReporteeAndRedirectQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link ChangeReportee}.
 */
class ChangeReporteeQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the new reportee.
     *
     * @param {string} partyUuid Party UUID of the new reportee.
     * @returns {ChangeReporteeQueryBuilder} This builder, for chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Optional. Party id of the new reportee.
     *
     * @param {number} partyId Party id of the new reportee.
     * @returns {ChangeReporteeQueryBuilder} This builder, for chaining.
     */
    withPartyId(partyId) {
        this.query.partyId = partyId;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {ChangeReporteeQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

export {
    ChangeReporteeAndRedirectQueryBuilder,
    ChangeReporteeQueryBuilder,
};
