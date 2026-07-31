/**
 * Builder for creating authorized parties lookup requests.
 */
class AuthorizedPartiesRequestBuilder {
    constructor() {
        this.request = {
            partyFilter: null,
        };
    }

    /**
     * Set the subject using an explicit URN type.
     *
     * @param {string} type Subject URN type.
     * @param {string} value Subject identifier value.
     * @returns {AuthorizedPartiesRequestBuilder} Builder instance.
     */
    withSubject(type, value) {
        this.request.type = type;
        this.request.value = value;
        return this;
    }

    /**
     * Set a system user subject.
     *
     * @param {string} uuid System user UUID.
     * @returns {AuthorizedPartiesRequestBuilder} Builder instance.
     */
    withSystemUser(uuid) {
        this.request.type = "urn:altinn:systemuser:uuid";
        this.request.value = uuid;
        return this;
    }

    /**
     * Set a person subject.
     *
     * @param {string} nationalIdentityNumber Norwegian national identity number.
     * @returns {AuthorizedPartiesRequestBuilder} Builder instance.
     */
    withPerson(nationalIdentityNumber) {
        this.request.type = "urn:altinn:person:identifier-no";
        this.request.value = nationalIdentityNumber;
        return this;
    }

    /**
     * Set an organization subject.
     *
     * @param {string} organizationNumber Organization number.
     * @returns {AuthorizedPartiesRequestBuilder} Builder instance.
     */
    withOrganization(organizationNumber) {
        this.request.type = "urn:altinn:organization:identifier-no";
        this.request.value = organizationNumber;
        return this;
    }

    /**
     * Add party filters from the party reference format.
     *
     * Supported formats:
     * - org:<organizationNumber>
     * - person:<nationalIdentityNumber>
     *
     * @param {Array<string>|string} parties Party references.
     * @returns {AuthorizedPartiesRequestBuilder} Builder instance.
     */
    withPartyFilter(parties) {
        const partyList = Array.isArray(parties)
            ? parties
            : [parties];

        this.request.partyFilter = [
            ...(this.request.partyFilter ?? []),
            ...partyList.map((party) => {
                const [partyType, value] = party.split(":");

                if (partyType === "org") {
                    return {
                        type: "urn:altinn:organization:identifier-no",
                        value,
                    };
                }

                if (partyType === "person") {
                    return {
                        type: "urn:altinn:person:identifier-no",
                        value,
                    };
                }

                throw new Error(`Unsupported party type: ${partyType}`);
            }),
        ];

        return this;
    }

    /**
     * Add organization party filters.
     *
     * @param {Array<string>|string} organizationNumbers Organization numbers to filter by.
     * @returns {AuthorizedPartiesRequestBuilder} Builder instance.
     */
    withOrganizationFilter(organizationNumbers) {
        const organizations = Array.isArray(organizationNumbers)
            ? organizationNumbers
            : [organizationNumbers];

        this.request.partyFilter = [
            ...(this.request.partyFilter ?? []),
            ...organizations.map((organizationNumber) => ({
                type: "urn:altinn:organization:identifier-no",
                value: organizationNumber,
            })),
        ];

        return this;
    }

    /**
     * Add person party filters.
     *
     * @param {Array<string>|string} nationalIdentityNumbers National identity numbers to filter by.
     * @returns {AuthorizedPartiesRequestBuilder} Builder instance.
     */
    withPersonFilter(nationalIdentityNumbers) {
        const persons = Array.isArray(nationalIdentityNumbers)
            ? nationalIdentityNumbers
            : [nationalIdentityNumbers];

        this.request.partyFilter = [
            ...(this.request.partyFilter ?? []),
            ...persons.map((nationalIdentityNumber) => ({
                type: "urn:altinn:person:identifier-no",
                value: nationalIdentityNumber,
            })),
        ];

        return this;
    }

    /**
     * Build the request.
     *
     * @returns {AuthorizedPartiesRequest} Authorized parties request.
     */
    build() {
        if (!this.request.type || !this.request.value) {
            throw new Error("Subject must be specified");
        }

        return this.request;
    }
}

export { AuthorizedPartiesRequestBuilder };
