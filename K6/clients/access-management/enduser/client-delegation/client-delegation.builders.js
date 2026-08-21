import { AgentAccessPackagesQuery, AgentClientAccessPackagesQuery, AgentsQuery, ClientAccessPackagesQuery, ClientsQuery, CreateAgentQuery, DelegationBatchInputDto, DeleteAgentClientsQuery, DeleteAgentQuery, DeleteMyClientAccessPackagesQuery, DeleteMyClientProviderQuery, DeleteMyClientsQuery, MyClientsQuery, PersonInput } from "./client-delegation.types.js";

/**
 * Builder for the clients query of the authenticated party.
 */
class MyClientsQueryBuilder {
    constructor() {
        this.query = /** @type {MyClientsQuery} */ ({});
    }

    /**
     * Optional client provider filter. Can be called more than once.
     *
     * @param {string} provider Client provider UUID.
     * @returns {MyClientsQueryBuilder} This builder, for chaining.
     */
    addProvider(provider) {
        this.query.provider ??= [];
        this.query.provider.push(provider);
        return this;
    }

    /**
     * Optional client provider filter, replacing any previous providers.
     *
     * @param {Array<string>} providers Client provider UUIDs.
     * @returns {MyClientsQueryBuilder} This builder, for chaining.
     */
    withProviders(providers) {
        this.query.provider = providers;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {MyClientsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query used when revoking access to a client of the
 * authenticated party.
 */
class DeleteMyClientsQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteMyClientsQuery} */ ({});
    }

    /**
     * Required client provider.
     *
     * @param {string} provider Client provider UUID.
     * @returns {DeleteMyClientsQueryBuilder} This builder, for chaining.
     */
    withProvider(provider) {
        this.query.provider = provider;
        return this;
    }

    /**
     * Required client the access is held on.
     *
     * @param {string} from Client party UUID.
     * @returns {DeleteMyClientsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optionally also revoke delegations derived from the access.
     *
     * @param {boolean} [cascade] Whether to cascade the revoke.
     * @returns {DeleteMyClientsQueryBuilder} This builder, for chaining.
     */
    withCascade(cascade = true) {
        this.query.cascade = cascade;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteMyClientsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query used when removing a client provider of the
 * authenticated party.
 */
class DeleteMyClientProviderQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteMyClientProviderQuery} */ ({});
    }

    /**
     * Required client provider.
     *
     * @param {string} provider Client provider UUID.
     * @returns {DeleteMyClientProviderQueryBuilder} This builder, for chaining.
     */
    withProvider(provider) {
        this.query.provider = provider;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteMyClientProviderQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query used when revoking access packages on a client of the
 * authenticated party.
 */
class DeleteMyClientAccessPackagesQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteMyClientAccessPackagesQuery} */ ({});
    }

    /**
     * Required client provider.
     *
     * @param {string} provider Client provider UUID.
     * @returns {DeleteMyClientAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withProvider(provider) {
        this.query.provider = provider;
        return this;
    }

    /**
     * Required client the access packages are held on.
     *
     * @param {string} from Client party UUID.
     * @returns {DeleteMyClientAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteMyClientAccessPackagesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the clients query of a party.
 */
class ClientsQueryBuilder {
    constructor() {
        this.query = /** @type {ClientsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {ClientsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional role filter. Can be called more than once.
     *
     * @param {string} role Role code.
     * @returns {ClientsQueryBuilder} This builder, for chaining.
     */
    addRole(role) {
        this.query.roles ??= [];
        this.query.roles.push(role);
        return this;
    }

    /**
     * Optional role filter, replacing any previous roles.
     *
     * @param {Array<string>} roles Role codes.
     * @returns {ClientsQueryBuilder} This builder, for chaining.
     */
    withRoles(roles) {
        this.query.roles = roles;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {ClientsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the agents query of a party.
 */
class AgentsQueryBuilder {
    constructor() {
        this.query = /** @type {AgentsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {AgentsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {AgentsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query used when adding an agent to a party.
 */
class CreateAgentQueryBuilder {
    constructor() {
        this.query = /** @type {CreateAgentQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {CreateAgentQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional party UUID of an existing person to add as agent. When omitted,
     * the person is looked up from the request body instead.
     *
     * @param {string} to Agent party UUID.
     * @returns {CreateAgentQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateAgentQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query used when removing an agent from a party.
 */
class DeleteAgentQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteAgentQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteAgentQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required agent to remove.
     *
     * @param {string} to Agent party UUID.
     * @returns {DeleteAgentQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optionally also revoke delegations held by the agent.
     *
     * @param {boolean} [cascade] Whether to cascade the revoke.
     * @returns {DeleteAgentQueryBuilder} This builder, for chaining.
     */
    withCascade(cascade = true) {
        this.query.cascade = cascade;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAgentQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query used when revoking an agent's access to a client.
 */
class DeleteAgentClientsQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteAgentClientsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteAgentClientsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required client the access is held on.
     *
     * @param {string} from Client party UUID.
     * @returns {DeleteAgentClientsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required agent the access is revoked from.
     *
     * @param {string} to Agent party UUID.
     * @returns {DeleteAgentClientsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optionally also revoke delegations derived from the access.
     *
     * @param {boolean} [cascade] Whether to cascade the revoke.
     * @returns {DeleteAgentClientsQueryBuilder} This builder, for chaining.
     */
    withCascade(cascade = true) {
        this.query.cascade = cascade;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAgentClientsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the access packages query of an agent.
 */
class AgentAccessPackagesQueryBuilder {
    constructor() {
        this.query = /** @type {AgentAccessPackagesQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {AgentAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required agent.
     *
     * @param {string} to Agent party UUID.
     * @returns {AgentAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {AgentAccessPackagesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query used when delegating or revoking access packages for an
 * agent on a specific client.
 */
class AgentClientAccessPackagesQueryBuilder {
    constructor() {
        this.query = /** @type {AgentClientAccessPackagesQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {AgentClientAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required client the access packages belong to.
     *
     * @param {string} from Client party UUID.
     * @returns {AgentClientAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required agent the access packages are delegated to.
     *
     * @param {string} to Agent party UUID.
     * @returns {AgentClientAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {AgentClientAccessPackagesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the access packages query of a client.
 */
class ClientAccessPackagesQueryBuilder {
    constructor() {
        this.query = /** @type {ClientAccessPackagesQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {ClientAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required client the access packages are held on.
     *
     * @param {string} from Client party UUID.
     * @returns {ClientAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {ClientAccessPackagesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for a batch of role and access package permissions.
 *
 * @example
 * const body = new DelegationBatchInputBuilder()
 *     .addPermission("regnskapsforer", [
 *         "urn:altinn:accesspackage:regnskapsforer-med-signeringsrettighet",
 *     ])
 *     .build();
 */
class DelegationBatchInputBuilder {
    constructor() {
        this.body = { values: [] };
    }

    /**
     * Adds a role with the access packages to apply for it.
     *
     * @param {string} role Role code.
     * @param {Array<string>} packages Access package URNs.
     * @returns {DelegationBatchInputBuilder} This builder, for chaining.
     */
    addPermission(role, packages) {
        this.body.values.push({ role, packages });
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {DelegationBatchInputDto} The built payload.
     */
    build() {
        return this.body;
    }
}

/**
 * Builder for the person input used when adding an agent.
 */
class PersonInputBuilder {
    constructor() {
        this.body = /** @type {PersonInput} */ ({});
    }

    /**
     * Person identifier.
     *
     * @param {string} personIdentifier
     * Either an 11-digit national identity number or a username.
     * @returns {PersonInputBuilder} This builder, for chaining.
     */
    withPersonIdentifier(personIdentifier) {
        this.body.personIdentifier = personIdentifier;
        return this;
    }

    /**
     * Last name of the person.
     *
     * @param {string} lastName Last name.
     * @returns {PersonInputBuilder} This builder, for chaining.
     */
    withLastName(lastName) {
        this.body.lastName = lastName;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {PersonInput} The built payload.
     */
    build() {
        return this.body;
    }
}

export {
    AgentAccessPackagesQueryBuilder,
    AgentClientAccessPackagesQueryBuilder,
    AgentsQueryBuilder,
    ClientAccessPackagesQueryBuilder,
    ClientsQueryBuilder,
    CreateAgentQueryBuilder,
    DelegationBatchInputBuilder,
    DeleteAgentClientsQueryBuilder,
    DeleteAgentQueryBuilder,
    DeleteMyClientAccessPackagesQueryBuilder,
    DeleteMyClientProviderQueryBuilder,
    DeleteMyClientsQueryBuilder,
    MyClientsQueryBuilder,
    PersonInputBuilder,
};
