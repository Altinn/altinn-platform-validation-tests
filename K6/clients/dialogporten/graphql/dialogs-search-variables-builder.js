/**
 * @typedef {Object} DialogSearchVariables
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
     * @param {string []} parties 
     * @returns 
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
     * Add parties to the search variables. The party URIs must be in the format urn:altinn:person:identifier-no:{pid} or urn:altinn:organization:identifier-no:{orgnr}.
     * @param {string []} parties. Parties already on the URI format urn:altinn:person:identifier-no:{pid} or urn:altinn:organization:identifier-no:{orgnr}
     * @returns 
     */
    withPartyURIs(partyURIs) {
        this.variables.partyURIs = Array.isArray(partyURIs) ? partyURIs : [partyURIs];
        return this;
    }

    /**
     * Adds a search string to the search variables. The search string can be used to search for dialogs that contain the specified string in the title or content of the dialog.
     * @param {searchterm} search 
     * @returns 
     */
    withSearch(search) {
        this.variables.search = search;
        return this;
    }

    /**
     * Adds an organization filter to the search variables. The organization filter can be used to search for dialogs that are associated with the specified organization(s). 
     * The organizations will be the short abbreviation of the organization, e.g. "nav" for the Norwegian Labour and Welfare Administration, "skd" for the Norwegian Tax Administration, etc.
     * @param {string []} orgs. The short abbreviation of the organization(s) to filter by, e.g. "nav" for the Norwegian Labour and Welfare Administration, "skd" for the Norwegian Tax Administration, etc.
     * @returns 
     */
    withOrg(org) {
        this.variables.org = Array.isArray(org) ? org : [org];
        return this;
    }

    /**
     * Adds a status filter to the search variables. The status filter can be used to search for dialogs that have the specified status(es). Valid statuses are: NOT_APPLICABLE, IN_PROGRESS, AWAITING, REQUIRES_ATTENTION, COMPLETED.
     * @param {string | string []} status The status or statuses to filter by. Valid statuses are: NOT_APPLICABLE, IN_PROGRESS, AWAITING, REQUIRES_ATTENTION, COMPLETED. 
     * @returns 
     */
    withStatus(status) {
        this.variables.status = Array.isArray(status) ? status : [status];
        return this;
    }

    /**
     * Adds a continuation token to the search variables. The continuation token can be used to paginate through search results. When a search query returns more results than the specified limit, a continuation token is included in the response. This token can be used in a subsequent search query to retrieve the next page of results.
     * @param {*} token 
     * @returns 
     */
    withContinuationToken(token) {
        this.variables.continuationToken = token;
        return this;
    }

    /**
     * Adds a limit to the search variables. The limit can be used to specify the maximum number of results to return in a search query. If the number of results exceeds the limit, a continuation token will be included in the response that can be used to retrieve the next page of results.
     * @param { number } limit must be between 1 and 1000. 
     * @returns 
     */
    withLimit(limit) {
        this.variables.limit = limit;
        return this;
    }

    /**
     * @param {string|string[]} label
     * @returns {DialogSearchVariablesBuilder}
     */
    withLabel(label) {
        this.variables.label = Array.isArray(label)
            ? label
            : [label];

        return this;
    }

    /**
     * @param {string} updatedAfter
     * @returns {DialogSearchVariablesBuilder}
     */
    withUpdatedAfter(updatedAfter) {
        this.variables.updatedAfter = updatedAfter;
        return this;
    }

    /**
     * @param {string} updatedBefore
     * @returns {DialogSearchVariablesBuilder}
     */
    withUpdatedBefore(updatedBefore) {
        this.variables.updatedBefore = updatedBefore;
        return this;
    }

    /**
     * @param {string} searchLanguageCode
     * @returns {DialogSearchVariablesBuilder}
     */
    withSearchLanguageCode(searchLanguageCode) {
        this.variables.searchLanguageCode = searchLanguageCode;
        return this;
    }

    /**
     * @param {string|string[]} serviceResources
     * @returns {DialogSearchVariablesBuilder}
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
