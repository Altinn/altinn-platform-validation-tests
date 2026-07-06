/**
 * @typedef {object} DialogSearchVariables
 * @property {string[]} partyURIs
 * @property {string=} search
 * @property {string[]=} org
 * @property {string[]=} status
 * @property {string=} continuationToken
 * @property {number=} limit
 * @property {string[]=} label
 * @property {string=} updatedAfter
 * @property {string=} updatedBefore
 * @property {string=} searchLanguageCode
 * @property {string[]=} serviceResources
 */

/**
 * Builder for Dialogporten GraphQL search variables.
 */
export class DialogSearchVariablesBuilder {
    constructor() {
        this.variables = {
            partyURIs: [],
            status: [
                "NOT_APPLICABLE",
                "IN_PROGRESS",
                "AWAITING",
                "REQUIRES_ATTENTION",
                "COMPLETED",
            ],
            serviceResources: [],
            label: ["DEFAULT"],
            limit: 100,
            searchLanguageCode: "nb",
        };
    }

    /**
     * Add parties to the search variables. The party ids can be either pid/ssn (11 digits) or org number (9 digits), and the builder will convert them to the expected party URI format.
     *
     * @param {string []} parties TODO: description
     * @returns {DialogSearchVariablesBuilder} TODO: description
     */
    withParties(parties) {
        const partyUris = [];
        for (const party of parties) {
            let partyUri = "";
            if (party.length === 11) {
                partyUri = `urn:altinn:person:identifier-no:${party}`;
            }
            else if (party.length === 9) {
                partyUri = `urn:altinn:organization:identifier-no:${party}`;
            } else {
                throw new Error(`Invalid party id: ${party}`);
            }
            partyUris.push(partyUri);
        }
        this.variables.partyURIs = partyUris;
        return this;
    }

    /**
     * Adds party URIs to the search variables.
     * Party URIs must be in the format
     * `urn:altinn:person:identifier-no:{pid}` or
     * `urn:altinn:organization:identifier-no:{orgnr}`.
     *
     * @param {string|string[]} partyURIs - One or more party URIs.
     * @returns {DialogSearchVariablesBuilder} The builder instance for chaining.
     */
    withPartyURIs(partyURIs) {
        this.variables.partyURIs = Array.isArray(partyURIs) ? partyURIs : [partyURIs];
        return this;
    }

    /**
     * Adds a search string to the search variables. The search string can be used to search for dialogs that contain the specified string in the title or content of the dialog.
     *
     * @param {searchterm} search TODO: description
     * @returns {DialogSearchVariablesBuilder} TODO: description
     */
    withSearch(search) {
        this.variables.search = search;
        return this;
    }

    /**
     * Adds one or more organization filters to the search variables.
     * The organization filter is used to search for dialogs associated with the
     * specified organization(s).
     *
     * Organizations are identified by their short abbreviation, such as `nav`
     * for the Norwegian Labour and Welfare Administration or `skd` for the
     * Norwegian Tax Administration.
     *
     * @param {string|string[]} orgs - One or more organization abbreviations.
     * @returns {DialogSearchVariablesBuilder} The builder instance for chaining.
     */
    withOrgs(orgs) {
        this.variables.org = Array.isArray(orgs) ? orgs : [orgs];
        return this;
    }

    /**
     * Adds a status filter to the search variables. The status filter can be used to search for dialogs that have the specified status(es). Valid statuses are: NOT_APPLICABLE, IN_PROGRESS, AWAITING, REQUIRES_ATTENTION, COMPLETED.
     *
     * @param {string | string []} status The status or statuses to filter by. Valid statuses are: NOT_APPLICABLE, IN_PROGRESS, AWAITING, REQUIRES_ATTENTION, COMPLETED.
     * @returns {DialogSearchVariablesBuilder} TODO: description
     */
    withStatus(status) {
        this.variables.status = Array.isArray(status) ? status : [status];
        return this;
    }

    /**
     * Adds a continuation token to the search variables. The continuation token can be used to paginate through search results. When a search query returns more results than the specified limit, a continuation token is included in the response. This token can be used in a subsequent search query to retrieve the next page of results.
     *
     * @param {*} token TODO: description
     * @returns {DialogSearchVariablesBuilder} TODO: description
     */
    withContinuationToken(token) {
        this.variables.continuationToken = token;
        return this;
    }

    /**
     * Adds a limit to the search variables. The limit can be used to specify the maximum number of results to return in a search query. If the number of results exceeds the limit, a continuation token will be included in the response that can be used to retrieve the next page of results.
     *
     * @param { number } limit must be between 1 and 1000.
     * @returns {DialogSearchVariablesBuilder} TODO: description
     */
    withLimit(limit) {
        this.variables.limit = limit;
        return this;
    }

    /**
     * @param {string|string[]} label TODO: description
     * @returns {DialogSearchVariablesBuilder} TODO: description
     */
    withLabel(label) {
        this.variables.label = Array.isArray(label)
            ? label
            : [label];

        return this;
    }

    /**
     * @param {string} updatedAfter TODO: description
     * @returns {DialogSearchVariablesBuilder} TODO: description
     */
    withUpdatedAfter(updatedAfter) {
        this.variables.updatedAfter = updatedAfter;
        return this;
    }

    /**
     * @param {string} updatedBefore TODO: description
     * @returns {DialogSearchVariablesBuilder} TODO: description
     */
    withUpdatedBefore(updatedBefore) {
        this.variables.updatedBefore = updatedBefore;
        return this;
    }

    /**
     * @param {string} searchLanguageCode TODO: description
     * @returns {DialogSearchVariablesBuilder} TODO: description
     */
    withSearchLanguageCode(searchLanguageCode) {
        this.variables.searchLanguageCode = searchLanguageCode;
        return this;
    }

    /**
     * @param {string|string[]} serviceResources TODO: description
     * @returns {DialogSearchVariablesBuilder} TODO: description
     */
    withServiceResources(serviceResources) {
        this.variables.serviceResources =
            Array.isArray(serviceResources)
                ? serviceResources
                : [serviceResources];

        return this;
    }

    /**
     * @returns {DialogSearchVariables}
     */

    build() {
        return { ...this.variables };
    }
}
