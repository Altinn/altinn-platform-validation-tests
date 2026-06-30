/**
 * @typedef {Object} DialogSearchParams
 * @property {string[]=} party
 * @property {string[]=} org
 * @property {string[]=} serviceResource
 * @property {string[]=} extendedStatus
 * @property {string=} externalReference
 * @property {string[]=} status
 * @property {string=} createdAfter
 * @property {string=} createdBefore
 * @property {string=} updatedAfter
 * @property {string=} updatedBefore
 * @property {string=} contentUpdatedAfter
 * @property {string=} contentUpdatedBefore
 * @property {boolean=} isContentSeen
 * @property {string=} dueAfter
 * @property {string=} dueBefore
 * @property {string=} process
 * @property {string[]=} systemLabel
 * @property {boolean=} excludeApiOnly
 * @property {string=} search
 * @property {string=} searchLanguageCode
 * @property {string=} orderBy
 * @property {string=} continuationToken
 * @property {number=} limit
 */

/**
 * Builder for Dialogporten REST enduser search query params.
 * @see https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/SearchDialogs
 */
export class DialogSearchParamsBuilder {
    constructor() {
        this.params = {
        };
    }

    /**
     * Add parties by raw identifier (11-digit SSN or 9-digit org number).
     * Converts to the expected URI format automatically.
     * @param {string[]} parties
     * @returns {DialogSearchParamsBuilder}
     */
    withParties(parties) {
        this.params.party = parties.map((party) => {
            if (party.length === 11) {
                return `urn:altinn:person:identifier-no:${party}`;
            }
            if (party.length === 9) {
                return `urn:altinn:organization:identifier-no:${party}`;
            }
            throw new Error(`Invalid party id: ${party}`);
        });
        return this;
    }

    /**
     * Add parties already in URI format (urn:altinn:person:identifier-no:{pid} or urn:altinn:organization:identifier-no:{orgnr}).
     * @param {string|string[]} partyURIs
     * @returns {DialogSearchParamsBuilder}
     */
    withPartyURIs(partyURIs) {
        this.params.party = Array.isArray(partyURIs) ? partyURIs : [partyURIs];
        return this;
    }

    /**
     * @param {string|string[]} org Short service owner codes, e.g. "nav", "skd"
     * @returns {DialogSearchParamsBuilder}
     */
    withOrg(org) {
        this.params.org = Array.isArray(org) ? org : [org];
        return this;
    }

    /**
     * @param {string|string[]} serviceResource
     * @returns {DialogSearchParamsBuilder}
     */
    withServiceResource(serviceResource) {
        this.params.serviceResource = Array.isArray(serviceResource)
            ? serviceResource
            : [serviceResource];
        return this;
    }

    /**
     * @param {string|string[]} extendedStatus
     * @returns {DialogSearchParamsBuilder}
     */
    withExtendedStatus(extendedStatus) {
        this.params.extendedStatus = Array.isArray(extendedStatus)
            ? extendedStatus
            : [extendedStatus];
        return this;
    }

    /**
     * @param {string} externalReference
     * @returns {DialogSearchParamsBuilder}
     */
    withExternalReference(externalReference) {
        this.params.externalReference = externalReference;
        return this;
    }

    /**
     * @param {string|string[]} status Valid values: "NotApplicable", "InProgress", "Awaiting", "RequiresAttention", "Completed", "Draft"
     * @returns {DialogSearchParamsBuilder}
     */
    withStatus(status) {
        this.params.status = Array.isArray(status) ? status : [status];
        return this;
    }

    /**
     * @param {string} createdAfter ISO 8601 date-time
     * @returns {DialogSearchParamsBuilder}
     */
    withCreatedAfter(createdAfter) {
        this.params.createdAfter = createdAfter;
        return this;
    }

    /**
     * @param {string} createdBefore ISO 8601 date-time
     * @returns {DialogSearchParamsBuilder}
     */
    withCreatedBefore(createdBefore) {
        this.params.createdBefore = createdBefore;
        return this;
    }

    /**
     * @param {string} updatedAfter ISO 8601 date-time
     * @returns {DialogSearchParamsBuilder}
     */
    withUpdatedAfter(updatedAfter) {
        this.params.updatedAfter = updatedAfter;
        return this;
    }

    /**
     * @param {string} updatedBefore ISO 8601 date-time
     * @returns {DialogSearchParamsBuilder}
     */
    withUpdatedBefore(updatedBefore) {
        this.params.updatedBefore = updatedBefore;
        return this;
    }

    /**
     * @param {string} contentUpdatedAfter ISO 8601 date-time
     * @returns {DialogSearchParamsBuilder}
     */
    withContentUpdatedAfter(contentUpdatedAfter) {
        this.params.contentUpdatedAfter = contentUpdatedAfter;
        return this;
    }

    /**
     * @param {string} contentUpdatedBefore ISO 8601 date-time
     * @returns {DialogSearchParamsBuilder}
     */
    withContentUpdatedBefore(contentUpdatedBefore) {
        this.params.contentUpdatedBefore = contentUpdatedBefore;
        return this;
    }

    /**
     * @param {boolean} isContentSeen
     * @returns {DialogSearchParamsBuilder}
     */
    withIsContentSeen(isContentSeen) {
        this.params.isContentSeen = isContentSeen;
        return this;
    }

    /**
     * @param {string} dueAfter ISO 8601 date-time
     * @returns {DialogSearchParamsBuilder}
     */
    withDueAfter(dueAfter) {
        this.params.dueAfter = dueAfter;
        return this;
    }

    /**
     * @param {string} dueBefore ISO 8601 date-time
     * @returns {DialogSearchParamsBuilder}
     */
    withDueBefore(dueBefore) {
        this.params.dueBefore = dueBefore;
        return this;
    }

    /**
     * @param {string} process
     * @returns {DialogSearchParamsBuilder}
     */
    withProcess(process) {
        this.params.process = process;
        return this;
    }

    /**
     * @param {string|string[]} systemLabel Valid values: "Default", "Bin", "Archive", "MarkedAsUnopened", "Sent"
     * @returns {DialogSearchParamsBuilder}
     */
    withSystemLabel(systemLabel) {
        this.params.systemLabel = Array.isArray(systemLabel)
            ? systemLabel
            : [systemLabel];
        return this;
    }

    /**
     * @param {boolean} excludeApiOnly
     * @returns {DialogSearchParamsBuilder}
     */
    withExcludeApiOnly(excludeApiOnly) {
        this.params.excludeApiOnly = excludeApiOnly;
        return this;
    }

    /**
     * @param {string} search Fuzzy-matched against all free-text fields
     * @returns {DialogSearchParamsBuilder}
     */
    withSearch(search) {
        this.params.search = search;
        return this;
    }

    /**
     * @param {string} searchLanguageCode BCP 47 language code, e.g. "nb", "en"
     * @returns {DialogSearchParamsBuilder}
     */
    withSearchLanguageCode(searchLanguageCode) {
        this.params.searchLanguageCode = searchLanguageCode;
        return this;
    }

    /**
     * @param {string} orderBy Defaults to "contentUpdatedAt desc" when omitted
     * @returns {DialogSearchParamsBuilder}
     */
    withOrderBy(orderBy) {
        this.params.orderBy = orderBy;
        return this;
    }

    /**
     * @param {string} continuationToken Returned by a previous search when more pages are available
     * @returns {DialogSearchParamsBuilder}
     */
    withContinuationToken(continuationToken) {
        this.params.continuationToken = continuationToken;
        return this;
    }

    /**
     * @param {number} limit Results per page, 1–1000. Default: 100.
     * @returns {DialogSearchParamsBuilder}
     */
    withLimit(limit) {
        this.params.limit = limit;
        return this;
    }

    /**
     * @returns {DialogSearchParams}
     */
    build() {
        return { ...this.params };
    }
}
