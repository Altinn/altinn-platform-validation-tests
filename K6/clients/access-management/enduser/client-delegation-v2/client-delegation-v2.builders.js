import { AgentResourcesQuery, AgentsQuery, ClientResourcesQuery, ClientsQuery, DelegateAgentResourcesQuery, ResourceDelegationBatchInputDto } from "./client-delegation-v2.types.js";

/**
 * Builder for the query on GET agents/resources.
 */
class AgentResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {AgentResourcesQuery} */ ({});
    }

    /**
     * Sets the party the agent belongs to.
     *
     * @param {string} party Party UUID.
     * @returns {AgentResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Sets the agent to read resources for.
     *
     * @param {string} agent Agent UUID.
     * @returns {AgentResourcesQueryBuilder} This builder, for chaining.
     */
    withAgent(agent) {
        this.query.agent = agent;
        return this;
    }

    /**
     * Builds the query.
     *
     * @returns {AgentResourcesQuery} The built query.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query on GET clients/resources.
 */
class ClientResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {ClientResourcesQuery} */ ({});
    }

    /**
     * Sets the party the client belongs to.
     *
     * @param {string} party Party UUID.
     * @returns {ClientResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Sets the client to read resources for.
     *
     * @param {string} client Client UUID.
     * @returns {ClientResourcesQueryBuilder} This builder, for chaining.
     */
    withClient(client) {
        this.query.client = client;
        return this;
    }

    /**
     * Builds the query.
     *
     * @returns {ClientResourcesQuery} The built query.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query the two write endpoints share.
 */
class DelegateAgentResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {DelegateAgentResourcesQuery} */ ({});
    }

    /**
     * Sets the party doing the delegating.
     *
     * @param {string} party Party UUID.
     * @returns {DelegateAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Sets the client the resources come from.
     *
     * @param {string} client Client UUID.
     * @returns {DelegateAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withClient(client) {
        this.query.client = client;
        return this;
    }

    /**
     * Sets the agent the resources go to.
     *
     * @param {string} agent Agent UUID.
     * @returns {DelegateAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withAgent(agent) {
        this.query.agent = agent;
        return this;
    }

    /**
     * Builds the query.
     *
     * @returns {DelegateAgentResourcesQuery} The built query.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the body the two write endpoints share.
 *
 * The resources are reference ids, not the resource UUIDs the read endpoints
 * return alongside them.
 */
class ResourceDelegationBatchInputBuilder {
    constructor() {
        this.body = /** @type {ResourceDelegationBatchInputDto} */ ({ values: [] });
    }

    /**
     * Adds a role with the resources to apply for it.
     *
     * @param {string} role Role code.
     * @param {Array<string>} resources Resource reference ids.
     * @returns {ResourceDelegationBatchInputBuilder} This builder, for chaining.
     */
    addPermission(role, resources) {
        this.body.values.push({ role, resources });
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {ResourceDelegationBatchInputDto} The built payload.
     */
    build() {
        return this.body;
    }
}

/**
 * Builder for the query on GET clients.
 */
class ClientsQueryBuilder {
    constructor() {
        this.query = /** @type {ClientsQuery} */ ({});
    }

    /**
     * Sets the party whose clients to list.
     *
     * @param {string} party Party UUID.
     * @returns {ClientsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Filters on role codes.
     *
     * @param {Array<string>} roles Role codes, e.g. ["rettighetshaver"].
     * @returns {ClientsQueryBuilder} This builder, for chaining.
     */
    withRoles(roles) {
        this.query.roles = roles;
        return this;
    }

    /**
     * Filters on access packages.
     *
     * @param {Array<string>} packages Access package urns.
     * @returns {ClientsQueryBuilder} This builder, for chaining.
     */
    withPackages(packages) {
        this.query.packages = packages;
        return this;
    }

    /**
     * Filters on resources.
     *
     * @param {Array<string>} resources Resource identifiers.
     * @returns {ClientsQueryBuilder} This builder, for chaining.
     */
    withResources(resources) {
        this.query.resources = resources;
        return this;
    }

    /**
     * Builds the query.
     *
     * @returns {ClientsQuery} The built query.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query on GET agents.
 */
class AgentsQueryBuilder {
    constructor() {
        this.query = /** @type {AgentsQuery} */ ({});
    }

    /**
     * Sets the party whose agents to list.
     *
     * @param {string} party Party UUID.
     * @returns {AgentsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query.
     *
     * @returns {AgentsQuery} The built query.
     */
    build() {
        return this.query;
    }
}

export {
    AgentResourcesQueryBuilder,
    AgentsQueryBuilder,
    ClientResourcesQueryBuilder,
    ClientsQueryBuilder,
    DelegateAgentResourcesQueryBuilder,
    ResourceDelegationBatchInputBuilder,
};
