/**
 * URN-encodes the value part of a party URN.
 *
 * Register describes this as URL-encoding that additionally does not allow `:`,
 * which is what separates the value from the URN prefix. `encodeURIComponent`
 * escapes `:` along with everything else that needs it, so it fits.
 *
 * The API also resolves unencoded values, but a username holding a `:` or a `+`
 * only works encoded, so everything free-text goes through here.
 *
 * @param {string} value The raw value.
 * @returns {string} The encoded value.
 */
function urnEncode(value) {
    return encodeURIComponent(value);
}

/**
 * Builds the list of party URNs to look up.
 *
 * One method per URN variant Register accepts, so a test asks for the identifier
 * it has instead of assembling the URN string itself. Every method appends, so a
 * single query can mix variants:
 *
 * @example
 * const urns = new PartyUrnQueryBuilder()
 *     .withUsername("Vegard")
 *     .withOrganizationIdentifier("314239458")
 *     .build();
 *
 * An identifier Register does not know is left out of the response rather than
 * failing the query, so a query for several URNs can come back with fewer
 * parties than it asked for.
 */
class PartyUrnQueryBuilder {
    constructor() {
        /** @type {Array<string>} */
        this.urns = [];
    }

    /**
     * Looks up a party by its Altinn party id.
     *
     * @param {number|string} partyId The party id.
     * @returns {PartyUrnQueryBuilder} This builder, for chaining.
     */
    withPartyId(partyId) {
        this.urns.push(`urn:altinn:party:id:${partyId}`);

        return this;
    }

    /**
     * Looks up a party by its UUID.
     *
     * Register ignores the type part of a party UUID URN, so this finds the party
     * with that UUID whether it is a person, an organization or a system user.
     *
     * @param {string} partyUuid The party UUID.
     * @returns {PartyUrnQueryBuilder} This builder, for chaining.
     */
    withPartyUuid(partyUuid) {
        this.urns.push(`urn:altinn:party:uuid:${partyUuid}`);

        return this;
    }

    /**
     * Looks up an organization by its organization number.
     *
     * @param {number|string} organizationIdentifier Organization number, 9 digits.
     * @returns {PartyUrnQueryBuilder} This builder, for chaining.
     */
    withOrganizationIdentifier(organizationIdentifier) {
        this.urns.push(
            `urn:altinn:organization:identifier-no:${organizationIdentifier}`,
        );

        return this;
    }

    /**
     * Looks up a person by their national identity number.
     *
     * @param {number|string} personIdentifier National identity number, 11 digits.
     * @returns {PartyUrnQueryBuilder} This builder, for chaining.
     */
    withPersonIdentifier(personIdentifier) {
        this.urns.push(`urn:altinn:person:identifier-no:${personIdentifier}`);

        return this;
    }

    /**
     * Looks up a party by its Altinn user id.
     *
     * @param {number|string} userId The user id.
     * @returns {PartyUrnQueryBuilder} This builder, for chaining.
     */
    withUserId(userId) {
        this.urns.push(`urn:altinn:user:id:${userId}`);

        return this;
    }

    /**
     * Looks up a party by username, which in practice means a self-identified
     * user. Case insensitive.
     *
     * @param {string} username The username, unencoded.
     * @returns {PartyUrnQueryBuilder} This builder, for chaining.
     */
    withUsername(username) {
        this.urns.push(`urn:altinn:party:username:${urnEncode(username)}`);

        return this;
    }

    /**
     * Looks up a self-identified user by the email they log in with through
     * ID-porten.
     *
     * @param {string} email The email address, unencoded.
     * @returns {PartyUrnQueryBuilder} This builder, for chaining.
     */
    withIdportenEmail(email) {
        this.urns.push(`urn:altinn:person:idporten-email:${urnEncode(email)}`);

        return this;
    }

    /**
     * Adds a URN as it is, for a variant this builder does not cover or for a
     * deliberately malformed one.
     *
     * @param {string} urn The URN.
     * @returns {PartyUrnQueryBuilder} This builder, for chaining.
     */
    withUrn(urn) {
        this.urns.push(urn);

        return this;
    }

    /**
     * @returns {Array<string>} The URNs, in the order they were added.
     */
    build() {
        return this.urns;
    }
}

export { PartyUrnQueryBuilder };
