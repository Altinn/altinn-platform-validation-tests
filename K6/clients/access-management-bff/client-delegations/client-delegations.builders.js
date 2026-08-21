import { DelegationBatchInputDto, ResourceDelegationBatchInputDto } from "../common/common.types.js";
import { CreateAgentAccessPackagesQuery, CreateAgentQuery, CreateAgentResourcesQuery, DeleteAgentAccessPackagesQuery, DeleteAgentQuery, DeleteAgentResourcesQuery, DeleteMyClientProvidersQuery, DeleteMyClientResourcesQuery, DeleteMyClientsQuery, GetAgentAccessPackagesQuery, GetAgentResourcesQuery, GetAgentsQuery, GetClientAccessPackagesQuery, GetClientResourcesQuery, GetClientsQuery, GetMyClientsQuery } from "./client-delegations.types.js";

/**
 * Builder for the query parameters of {@link GetMyClients}.
 */
class GetMyClientsQueryBuilder {
    constructor() {
        this.query = /** @type {GetMyClientsQuery} */ ({});
    }

    /**
     * Client provider UUIDs to filter by. Can be called more than once.
     *
     * @param {string} provider Client provider UUIDs to filter by.
     * @returns {GetMyClientsQueryBuilder} This builder, for chaining.
     */
    addProvider(provider) {
        this.query.provider ??= [];
        this.query.provider.push(provider);
        return this;
    }

    /**
     * Client provider UUIDs to filter by. Replaces any previous values.
     *
     * @param {Array<string>} provider Client provider UUIDs to filter by.
     * @returns {GetMyClientsQueryBuilder} This builder, for chaining.
     */
    withProvider(provider) {
        this.query.provider = provider;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetMyClientsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteMyClients}.
 */
class DeleteMyClientsQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteMyClientsQuery} */ ({});
    }

    /**
     * Optional. Client provider UUID.
     *
     * @param {string} provider Client provider UUID.
     * @returns {DeleteMyClientsQueryBuilder} This builder, for chaining.
     */
    withProvider(provider) {
        this.query.provider = provider;
        return this;
    }

    /**
     * Optional. Client party UUID.
     *
     * @param {string} from Client party UUID.
     * @returns {DeleteMyClientsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
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
 * Builder for the query parameters of {@link DeleteMyClientProviders}.
 */
class DeleteMyClientProvidersQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteMyClientProvidersQuery} */ ({});
    }

    /**
     * Optional. Client provider UUID.
     *
     * @param {string} provider Client provider UUID.
     * @returns {DeleteMyClientProvidersQueryBuilder} This builder, for chaining.
     */
    withProvider(provider) {
        this.query.provider = provider;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteMyClientProvidersQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetClients}.
 */
class GetClientsQueryBuilder {
    constructor() {
        this.query = /** @type {GetClientsQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetClientsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Role codes to filter by. Can be called more than once.
     *
     * @param {string} role Role codes to filter by.
     * @returns {GetClientsQueryBuilder} This builder, for chaining.
     */
    addRole(role) {
        this.query.roles ??= [];
        this.query.roles.push(role);
        return this;
    }

    /**
     * Role codes to filter by. Replaces any previous values.
     *
     * @param {Array<string>} roles Role codes to filter by.
     * @returns {GetClientsQueryBuilder} This builder, for chaining.
     */
    withRoles(roles) {
        this.query.roles = roles;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetClientsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetAgents}.
 */
class GetAgentsQueryBuilder {
    constructor() {
        this.query = /** @type {GetAgentsQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetAgentsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAgentsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateAgent}.
 */
class CreateAgentQueryBuilder {
    constructor() {
        this.query = /** @type {CreateAgentQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {CreateAgentQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID of the person to add as agent.
     *
     * @param {string} to Party UUID of the person to add as agent.
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
 * Builder for the query parameters of {@link DeleteAgent}.
 */
class DeleteAgentQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteAgentQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteAgentQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Agent party UUID.
     *
     * @param {string} to Agent party UUID.
     * @returns {DeleteAgentQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
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
 * Builder for the query parameters of {@link GetAgentAccessPackages}.
 */
class GetAgentAccessPackagesQueryBuilder {
    constructor() {
        this.query = /** @type {GetAgentAccessPackagesQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetAgentAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Agent party UUID.
     *
     * @param {string} to Agent party UUID.
     * @returns {GetAgentAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAgentAccessPackagesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateAgentAccessPackages}.
 */
class CreateAgentAccessPackagesQueryBuilder {
    constructor() {
        this.query = /** @type {CreateAgentAccessPackagesQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {CreateAgentAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Client party UUID.
     *
     * @param {string} from Client party UUID.
     * @returns {CreateAgentAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Agent party UUID.
     *
     * @param {string} to Agent party UUID.
     * @returns {CreateAgentAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateAgentAccessPackagesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteAgentAccessPackages}.
 */
class DeleteAgentAccessPackagesQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteAgentAccessPackagesQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteAgentAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Client party UUID.
     *
     * @param {string} from Client party UUID.
     * @returns {DeleteAgentAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Agent party UUID.
     *
     * @param {string} to Agent party UUID.
     * @returns {DeleteAgentAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAgentAccessPackagesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetClientAccessPackages}.
 */
class GetClientAccessPackagesQueryBuilder {
    constructor() {
        this.query = /** @type {GetClientAccessPackagesQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetClientAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Client party UUID.
     *
     * @param {string} from Client party UUID.
     * @returns {GetClientAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetClientAccessPackagesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetAgentResources}.
 */
class GetAgentResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {GetAgentResourcesQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Agent party UUID.
     *
     * @param {string} to Agent party UUID.
     * @returns {GetAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAgentResourcesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateAgentResources}.
 */
class CreateAgentResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {CreateAgentResourcesQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {CreateAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Client party UUID.
     *
     * @param {string} from Client party UUID.
     * @returns {CreateAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Agent party UUID.
     *
     * @param {string} to Agent party UUID.
     * @returns {CreateAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateAgentResourcesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteAgentResources}.
 */
class DeleteAgentResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteAgentResourcesQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Client party UUID.
     *
     * @param {string} from Client party UUID.
     * @returns {DeleteAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Agent party UUID.
     *
     * @param {string} to Agent party UUID.
     * @returns {DeleteAgentResourcesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAgentResourcesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetClientResources}.
 */
class GetClientResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {GetClientResourcesQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetClientResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Client party UUID.
     *
     * @param {string} from Client party UUID.
     * @returns {GetClientResourcesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetClientResourcesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteMyClientResources}.
 */
class DeleteMyClientResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteMyClientResourcesQuery} */ ({});
    }

    /**
     * Optional. Client provider UUID.
     *
     * @param {string} provider Client provider UUID.
     * @returns {DeleteMyClientResourcesQueryBuilder} This builder, for chaining.
     */
    withProvider(provider) {
        this.query.provider = provider;
        return this;
    }

    /**
     * Optional. Client party UUID.
     *
     * @param {string} from Client party UUID.
     * @returns {DeleteMyClientResourcesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteMyClientResourcesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for a batch of role and access package permissions.
 *
 * @example
 * const body = new DelegationBatchInputDtoBuilder()
 *     .addPermission("regnskapsforer", [
 *         "urn:altinn:accesspackage:regnskapsforer-med-signeringsrettighet",
 *     ])
 *     .build();
 */
class DelegationBatchInputDtoBuilder {
    constructor() {
        this.body = { values: [] };
    }

    /**
     * Adds a role with the access packages to apply for it.
     *
     * @param {string} role Role code.
     * @param {Array<string>} packages Access package URNs.
     * @returns {DelegationBatchInputDtoBuilder} This builder, for chaining.
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
 * Builder for a batch of role and resource permissions.
 *
 * @example
 * const body = new ResourceDelegationBatchInputDtoBuilder()
 *     .addPermission("regnskapsforer", ["ttd-altinn-events"])
 *     .build();
 */
class ResourceDelegationBatchInputDtoBuilder {
    constructor() {
        this.body = { values: [] };
    }

    /**
     * Adds a role with the resources to apply for it.
     *
     * @param {string} role Role code.
     * @param {Array<string>} resources Resource identifiers.
     * @returns {ResourceDelegationBatchInputDtoBuilder} This builder, for chaining.
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

export {
    CreateAgentAccessPackagesQueryBuilder,
    CreateAgentQueryBuilder,
    CreateAgentResourcesQueryBuilder,
    DelegationBatchInputDtoBuilder,
    DeleteAgentAccessPackagesQueryBuilder,
    DeleteAgentQueryBuilder,
    DeleteAgentResourcesQueryBuilder,
    DeleteMyClientProvidersQueryBuilder,
    DeleteMyClientResourcesQueryBuilder,
    DeleteMyClientsQueryBuilder,
    GetAgentAccessPackagesQueryBuilder,
    GetAgentResourcesQueryBuilder,
    GetAgentsQueryBuilder,
    GetClientAccessPackagesQueryBuilder,
    GetClientResourcesQueryBuilder,
    GetClientsQueryBuilder,
    GetMyClientsQueryBuilder,
    ResourceDelegationBatchInputDtoBuilder,
};
