export class DialogSearchVariablesBuilder {
    constructor() {
        this.variables = {
            partyURIs: [],
            status: [
                'NOT_APPLICABLE',
                'IN_PROGRESS',
                'AWAITING',
                'REQUIRES_ATTENTION',
                'COMPLETED',
            ],
            serviceResources: [],
            label: ['DEFAULT'],
            limit: 100,
            searchLanguageCode: 'nb',
        };
    }

    withParties(parties) {
        const partyUris = [];
        for (const party of parties) {
            let partyUri = ""
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

    withPartyURIs(partyURIs) {
        this.variables.partyURIs = Array.isArray(partyURIs) ? partyURIs : [partyURIs];
        return this;
    }

    withSearch(search) {
        this.variables.search = search;
        return this;
    }

    withOrg(org) {
        this.variables.org = Array.isArray(org) ? org : [org];
        return this;
    }

    withStatus(status) {
        this.variables.status = Array.isArray(status) ? status : [status];
        return this;
    }

    withContinuationToken(token) {
        this.variables.continuationToken = token;
        return this;
    }

    withLimit(limit) {
        this.variables.limit = limit;
        return this;
    }

    withLabel(label) {
        this.variables.label = Array.isArray(label) ? label : [label];
        return this;
    }

    withUpdatedAfter(dateTime) {
        this.variables.updatedAfter = dateTime;
        return this;
    }

    withUpdatedBefore(dateTime) {
        this.variables.updatedBefore = dateTime;
        return this;
    }

    withSearchLanguageCode(languageCode) {
        this.variables.searchLanguageCode = languageCode;
        return this;
    }

    withServiceResources(serviceResources) {
        this.variables.serviceResources = Array.isArray(serviceResources)
            ? serviceResources
            : [serviceResources];

        return this;
    }

    build() {
        return { ...this.variables };
    }
}